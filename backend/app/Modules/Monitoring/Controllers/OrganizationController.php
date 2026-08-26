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

                // Attach latest metrics from Acuvim to each device
                foreach ($organizations as $org) {
                    foreach ($org->facilities as $facility) {
                        foreach ($facility->devices as $device) {
                            // Fetch latest metrics for this device
                            $metrics = Acuvim::where('device_name', $device->name)
                                ->where('device_serial', $device->device_code)
                                ->orderBy('Timestamp', 'desc')
                                ->select(['Vlavg_V', 'Iavg_A', 'Psum_kW', 'Freq_Hz', 'PF', 'Timestamp'])
                                ->first();
                            
                            // Attach formatted metrics to device
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
