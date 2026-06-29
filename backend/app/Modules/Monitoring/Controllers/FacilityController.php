<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Monitoring\Concerns\ResolvesAuthRole;
use App\Modules\Monitoring\Models\Facility;
use App\Modules\Monitoring\Services\MonitoringCache;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FacilityController extends Controller
{
    use ResolvesAuthRole;

    public function index(Request $request)
    {
        if ($request->has('organization_id')) {
            $orgId = (int) $request->organization_id;
            $data = Cache::remember(
                MonitoringCache::facilitiesKey($orgId),
                MonitoringCache::TTL_SECONDS,
                fn () => $this->buildFacilitiesPayload($request),
            );

            return response()->json($data);
        }

        return response()->json($this->buildFacilitiesPayload($request));
    }

    private function buildFacilitiesPayload(Request $request): array
    {
        $query = Facility::withCount('devices');

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        $facilities = $query->get();
        $this->attachLastSyncedAt($facilities);

        return $facilities->toArray();
    }

    /**
     * Per facility: MAX(latest acquisition timestamp) across its registered devices.
     * Scoped to devices in the requested facilities only (not full acuvim table scan).
     */
    private function attachLastSyncedAt(Collection $facilities): void
    {
        if ($facilities->isEmpty()) {
            return;
        }

        $facilityIds = $facilities->pluck('id')->all();
        $epoch = '1970-01-01 00:00:00';

        $deviceRows = DB::table('monitoring_devices')
            ->whereIn('facility_id', $facilityIds)
            ->whereNull('deleted_at')
            ->get(['id', 'facility_id', 'device_code', 'name', 'last_heartbeat_at']);

        if ($deviceRows->isEmpty()) {
            $facilities->each(fn (Facility $facility) => $facility->setAttribute('last_synced_at', null));

            return;
        }

        $serials = $deviceRows->pluck('device_code')->filter()->unique()->values()->all();
        $names = $deviceRows->pluck('name')->filter()->unique()->values()->all();

        $acuvimBySerial = DB::table('monitoring_acuvim')
            ->selectRaw('device_serial, MAX(`Timestamp`) as max_ts, MAX(created_at) as max_created')
            ->whereNotNull('device_serial')
            ->when($serials !== [], fn ($q) => $q->whereIn('device_serial', $serials))
            ->when($serials === [], fn ($q) => $q->whereRaw('1 = 0'))
            ->groupBy('device_serial');

        $acuvimByName = DB::table('monitoring_acuvim')
            ->selectRaw('device_name, MAX(`Timestamp`) as max_ts, MAX(created_at) as max_created')
            ->whereNotNull('device_name')
            ->when($names !== [], fn ($q) => $q->whereIn('device_name', $names))
            ->when($names === [], fn ($q) => $q->whereRaw('1 = 0'))
            ->groupBy('device_name');

        $telemetryByDevice = DB::table('monitoring_telemetry_logs')
            ->selectRaw('device_id, MAX(recorded_at) as max_recorded')
            ->whereIn('device_id', $deviceRows->pluck('id')->all())
            ->groupBy('device_id');

        $rows = DB::table('monitoring_devices as d')
            ->leftJoinSub($acuvimBySerial, 'acs', 'acs.device_serial', '=', 'd.device_code')
            ->leftJoinSub($acuvimByName, 'acn', 'acn.device_name', '=', 'd.name')
            ->leftJoinSub($telemetryByDevice, 'tel', 'tel.device_id', '=', 'd.id')
            ->whereIn('d.facility_id', $facilityIds)
            ->whereNull('d.deleted_at')
            ->groupBy('d.facility_id')
            ->selectRaw(
                'd.facility_id,
                MAX(GREATEST(
                    COALESCE(d.last_heartbeat_at, ?),
                    COALESCE(acs.max_ts, ?),
                    COALESCE(acs.max_created, ?),
                    COALESCE(acn.max_ts, ?),
                    COALESCE(acn.max_created, ?),
                    COALESCE(tel.max_recorded, ?)
                )) as last_synced_at',
                [$epoch, $epoch, $epoch, $epoch, $epoch, $epoch]
            )
            ->get()
            ->keyBy('facility_id');

        $facilities->each(function (Facility $facility) use ($rows, $epoch) {
            $raw = $rows->get($facility->id)?->last_synced_at;

            if (! $raw || str_starts_with((string) $raw, '1970')) {
                $facility->setAttribute('last_synced_at', null);

                return;
            }

            $facility->setAttribute('last_synced_at', Carbon::parse($raw)->toIso8601String());
        });
    }

    public function store(Request $request)
    {
        if ($response = $this->denyIfMonitoringViewOnly($request)) {
            return $response;
        }

        $validated = $request->validate([
            'organization_id' => 'required|exists:monitoring_organizations,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:monitoring_facilities',
            'location_name' => 'nullable|string|max:255',
            'full_address' => 'nullable|string',
            'facility_type' => 'nullable|string|max:100',
            'manager_name' => 'nullable|string|max:255',
            'status' => 'in:Online,Offline,Maintenance,Commissioning',
        ]);

        $facility = Facility::create($validated);
        MonitoringCache::bump();

        return response()->json($facility, 201);
    }

    public function show($id)
    {
        return response()->json(Facility::with(['organization', 'devices'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $facility = Facility::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location_name' => 'nullable|string|max:255',
            'facility_type' => 'nullable|string|max:100',
            'status' => 'in:Online,Offline,Maintenance,Commissioning',
        ]);

        $facility->update($validated);
        MonitoringCache::bump();

        return response()->json($facility);
    }

    public function destroy($id)
    {
        $facility = Facility::findOrFail($id);
        $facility->delete();
        MonitoringCache::bump();

        return response()->json(null, 204);
    }
}
