<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\VehicleType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleTypeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = VehicleType::withCount('vehicles')->orderBy('name');
        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(fn($q) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('category', 'like', "%{$s}%"));
        }
        return response()->json($query->paginate(min($request->integer('per_page', 20), 100)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                           => ['required', 'string', 'max:150'],
            'category'                       => ['nullable', 'string', 'max:100'],
            'brand'                          => ['nullable', 'string', 'max:100'],
            'model'                          => ['nullable', 'string', 'max:100'],
            'default_oil_interval_km'        => ['nullable', 'integer', 'min:0'],
            'default_oil_interval_days'      => ['nullable', 'integer', 'min:0'],
            'default_service_interval_km'    => ['nullable', 'integer', 'min:0'],
            'default_service_interval_days'  => ['nullable', 'integer', 'min:0'],
            'default_service_interval_hours' => ['nullable', 'integer', 'min:0'],
            'notes'                          => ['nullable', 'string'],
        ]);
        return response()->json(VehicleType::create($data), 201);
    }

    public function update(Request $request, VehicleType $vehicleType): JsonResponse
    {
        $data = $request->validate([
            'name'                           => ['sometimes', 'string', 'max:150'],
            'category'                       => ['nullable', 'string', 'max:100'],
            'brand'                          => ['nullable', 'string', 'max:100'],
            'model'                          => ['nullable', 'string', 'max:100'],
            'default_oil_interval_km'        => ['nullable', 'integer', 'min:0'],
            'default_oil_interval_days'      => ['nullable', 'integer', 'min:0'],
            'default_service_interval_km'    => ['nullable', 'integer', 'min:0'],
            'default_service_interval_days'  => ['nullable', 'integer', 'min:0'],
            'default_service_interval_hours' => ['nullable', 'integer', 'min:0'],
            'notes'                          => ['nullable', 'string'],
            'is_active'                      => ['nullable', 'boolean'],
        ]);
        $vehicleType->update($data);
        return response()->json($vehicleType->fresh());
    }

    public function destroy(VehicleType $vehicleType): JsonResponse
    {
        $vehicleType->delete();
        return response()->json(['message' => 'Vehicle type deleted']);
    }
}
