<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Monitoring\Models\Facility;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index(Request $request)
    {
        $query = Facility::withCount('devices');
        
        if ($request->has('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }
        
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
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
