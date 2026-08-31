<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Monitoring\Concerns\ResolvesAuthRole;
use App\Modules\Monitoring\Models\Acuvim;
use App\Modules\Monitoring\Models\Organization;
use App\Modules\Monitoring\Services\DeviceStatusResolver;
use App\Modules\Monitoring\Services\MonitoringCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    use ResolvesAuthRole;

    public function __construct(
        private readonly DeviceStatusResolver $statusResolver,
    ) {}

    public function index()
    {
        return response()->json(Organization::withCount(['facilities', 'devices'])->get());
    }

    public function deviceTree()
    {
        $data = Cache::remember(
            MonitoringCache::deviceTreeKey(),
            MonitoringCache::DEVICE_TREE_TTL_SECONDS,
            function () {
                $organizations = Organization::with([
                    'facilities.devices' => fn ($q) => $q->orderBy('device_code'),
                ])->get();

                $devices = $organizations
                    ->flatMap(fn ($org) => $org->facilities->flatMap->devices);

                $this->statusResolver->applyToCollection($devices);

                // Fetch latest metrics efficiently using subquery
                $deviceSerials = $devices->pluck('device_code')->unique()->filter()->values()->toArray();

                $latestMetrics = [];
                if (!empty($deviceSerials)) {
                    // Use subquery to get only the latest record per device_serial
                    $latestMetrics = DB::table('monitoring_acuvim as a')
                        ->joinSub(
                            DB::table('monitoring_acuvim')
                                ->selectRaw('device_serial, MAX(Timestamp) as max_timestamp')
                                ->whereIn('device_serial', $deviceSerials)
                                ->groupBy('device_serial'),
                            'latest',
                            function ($join) {
                                $join->on('a.device_serial', '=', 'latest.device_serial')
                                     ->on('a.Timestamp', '=', 'latest.max_timestamp');
                            }
                        )
                        ->select(['a.device_serial', 'a.Vlavg_V', 'a.Iavg_A', 'a.Psum_kW', 'a.Freq_Hz', 'a.PF', 'a.Timestamp'])
                        ->get()
                        ->keyBy('device_serial')
                        ->toArray();
                }

                // Attach metrics to devices
                foreach ($organizations as $org) {
                    foreach ($org->facilities as $facility) {
                        foreach ($facility->devices as $device) {
                            $metrics = $latestMetrics[$device->device_code] ?? null;

                            $device->latest_metrics = $metrics ? [
                                'voltage' => $metrics->Vlavg_V,
                                'current' => $metrics->Iavg_A,
                                'power' => $metrics->Psum_kW,
                                'frequency' => $metrics->Freq_Hz,
                                'powerFactor' => $metrics->PF,
                                'timestamp' => $metrics->Timestamp,
                            ] : null;
                        }
                    }
                }

                return $organizations->toArray();
            }
        );

        return response()->json($data);
    }

    public function store(Request $request)
    {
        if ($response = $this->denyIfMonitoringViewOnly($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:monitoring_organizations',
            'industry' => 'nullable|string|max:100',
            'headquarters_address' => 'nullable|string',
            'tier' => 'in:Standard,Premium,Enterprise',
            'status' => 'in:Active,Maintenance,Suspended',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $org = Organization::create($validated);
        MonitoringCache::bump();

        return response()->json($org, 201);
    }

    public function show($id)
    {
        $org = Organization::with('facilities')->findOrFail($id);
        return response()->json($org);
    }

    public function update(Request $request, $id)
    {
        $org = Organization::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:monitoring_organizations,code,' . $id,
            'industry' => 'nullable|string|max:100',
            'headquarters_address' => 'nullable|string',
            'tier' => 'in:Standard,Premium,Enterprise',
            'status' => 'in:Active,Maintenance,Suspended',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $org->update($validated);
        MonitoringCache::bump();

        return response()->json($org);
    }

    public function destroy($id)
    {
        $org = Organization::findOrFail($id);
        $org->delete();
        MonitoringCache::bump();

        return response()->json(null, 204);
    }
}
