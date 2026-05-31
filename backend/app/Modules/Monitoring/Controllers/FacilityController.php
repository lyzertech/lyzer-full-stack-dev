<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Monitoring\Concerns\ResolvesAuthRole;
use App\Modules\Monitoring\Models\Facility;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FacilityController extends Controller
{
    use ResolvesAuthRole;

    public function index(Request $request)
    {
        $query = Facility::withCount('devices');

        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        $facilities = $query->get();
        $this->attachLastSyncedAt($facilities);

        return response()->json($facilities);
    }

    /**
     * Per facility: MAX(latest acquisition timestamp) across its registered devices.
     * Each device uses the newest of last_heartbeat_at, acuvim Timestamp (serial/name), telemetry recorded_at.
     */
    private function attachLastSyncedAt(Collection $facilities): void
    {
        if ($facilities->isEmpty()) {
            return;
        }

        $facilityIds = $facilities->pluck('id')->all();
        $epoch = '1970-01-01 00:00:00';

        $acuvimBySerial = DB::table('monitoring_acuvim')
            ->selectRaw('device_serial, MAX(`Timestamp`) as max_ts, MAX(created_at) as max_created')
            ->whereNotNull('device_serial')
            ->groupBy('device_serial');

        $acuvimByName = DB::table('monitoring_acuvim')
            ->selectRaw('device_name, MAX(`Timestamp`) as max_ts, MAX(created_at) as max_created')
            ->whereNotNull('device_name')
            ->groupBy('device_name');

        $telemetryByDevice = DB::table('monitoring_telemetry_logs')
            ->selectRaw('device_id, MAX(recorded_at) as max_recorded')
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
        return response()->json($facility);
    }

    public function destroy($id)
    {
        $facility = Facility::findOrFail($id);
        $facility->delete();
        return response()->json(null, 204);
    }
}
