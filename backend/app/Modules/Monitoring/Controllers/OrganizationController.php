<?php

namespace App\Modules\Monitoring\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Monitoring\Concerns\ResolvesAuthRole;
use App\Modules\Monitoring\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    use ResolvesAuthRole;
    public function index()
    {
        return response()->json(Organization::withCount(['facilities', 'devices'])->get());
    }

    public function deviceTree()
    {
        return response()->json(Organization::with(['facilities.devices'])->get());
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
        return response()->json($org);
    }

    public function destroy($id)
    {
        $org = Organization::findOrFail($id);
        $org->delete();
        return response()->json(null, 204);
    }
}
