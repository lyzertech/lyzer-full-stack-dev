<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Monitoring\Concerns\ResolvesAuthRole;
use App\Modules\Monitoring\Models\Device;
use App\Modules\Monitoring\Services\DeviceStatusResolver;
use App\Modules\Monitoring\Services\MonitoringCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DeviceController extends Controller
{
    use ResolvesAuthRole;

    public function __construct(
        private readonly DeviceStatusResolver $statusResolver,
    ) {}

    public function index(Request $request)
    {
        $query = Device::with('facility')->orderBy('device_code');

        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('organization_id')) {
            $query->whereHas('facility', function ($q) use ($request) {
                $q->where('organization_id', $request->organization_id);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('device_code', 'like', "%{$search}%");
            });
        }

        $perPage = min(max((int) $request->input('per_page', 8), 1), 100);
        $page = max((int) $request->input('page', 1), 1);
        $total = (clone $query)->count();

        $scopeCacheKey = MonitoringCache::deviceScopeKey($request);
        $scopeCached = Cache::get($scopeCacheKey);

        if (is_array($scopeCached)) {
            $stats = $scopeCached['stats'];
            $latestMap = $scopeCached['latest_map'];
        } else {
            $scopedDevices = (clone $query)->get([
                'id',
                'name',
                'device_code',
                'status',
                'device_type',
            ]);
            $latestMap = $this->statusResolver->buildLatestMap($scopedDevices);
            $stats = $this->statusResolver->summarize($scopedDevices, $latestMap);

            Cache::put($scopeCacheKey, [
                'stats' => $stats,
                'latest_map' => $latestMap,
            ], MonitoringCache::TTL_SECONDS);
        }

        $devices = (clone $query)
            ->forPage($page, $perPage)
            ->get();

        $threshold = now()->subMinutes(30);
        $devices->transform(function ($device) use ($latestMap, $threshold) {
            $device->status = $this->statusResolver->resolveStatus($device, $latestMap, $threshold);

            return $device;
        });

        return response()->json([
            'data' => $devices,
            'meta' => [
                'current_page' => $page,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
                'stats' => $stats,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if ($response = $this->denyIfMonitoringViewOnly($request)) {
            return $response;
        }

        $validated = $request->validate([
            'facility_id' => 'required|exists:monitoring_facilities,id',
            'name' => 'required|string|max:255',
            'device_code' => 'required|string|max:100|unique:monitoring_devices',
            'device_type' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'ip_address' => 'nullable|string|max:45',
            'connection_type' => 'nullable|in:Ethernet,WiFi,RS485,LoRaWAN,Cellular',
            'protocol' => 'nullable|in:Modbus-TCP,Modbus-RTU,MQTT,HTTP,SNMP,OPC-UA',
            'status' => 'in:Online,Offline,Warning,Inactive',
        ]);

        $device = Device::create($validated);
        MonitoringCache::bump();

        return response()->json($device, 201);
    }

    public function show($id)
    {
        $device = Device::with('facility.organization')->findOrFail($id);
        $this->statusResolver->applyToCollection(collect([$device]));

        return response()->json($device);
    }

    public function update(Request $request, $id)
    {
        $device = Device::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'ip_address' => 'nullable|string|max:45',
            'status' => 'in:Online,Offline,Warning,Inactive',
            'signal_strength' => 'nullable|integer|between:0,100',
        ]);

        $device->update($validated);
        MonitoringCache::bump();

        return response()->json($device);
    }

    public function destroy(Request $request, $id)
    {
        if ($response = $this->denyIfMonitoringViewOnly($request)) {
            return $response;
        }

        $device = Device::findOrFail($id);
        $device->delete();
        MonitoringCache::bump();

        return response()->json(null, 204);
    }
}
