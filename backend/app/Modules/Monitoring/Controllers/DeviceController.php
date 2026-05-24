<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Monitoring\Models\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $query = Device::with('facility');
        
        if ($request->has('facility_id')) {
            $query->where('facility_id', $request->facility_id);
        }

        if ($request->has('organization_id')) {
            $query->whereHas('facility', function($q) use ($request) {
                $q->where('organization_id', $request->organization_id);
            });
        }
        
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
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
        return response()->json($device, 201);
    }

    public function show($id)
    {
        return response()->json(Device::with('facility.organization')->findOrFail($id));
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
        return response()->json($device);
    }

    public function destroy($id)
    {
        $device = Device::findOrFail($id);
        $device->delete();
        return response()->json(null, 204);
    }
}
