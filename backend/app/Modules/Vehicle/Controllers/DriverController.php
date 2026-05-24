<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Driver::withCount('vehicles')->orderBy('name');

        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(fn($q) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('phone', 'like', "%{$s}%")
                ->orWhere('license_number', 'like', "%{$s}%"));
        }

        if ($request->filled('status')) $query->where('status', $request->string('status'));

        $perPage = min($request->integer('per_page', 15), 100);
        return response()->json($query->paginate($perPage));
    }

    public function show(Driver $driver): JsonResponse
    {
        $driver->load(['vehicles' => fn($q) => $q->where('status', '!=', 'Retired')]);
        return response()->json($driver);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_code'  => ['nullable', 'string', 'max:50', 'unique:vehicle_drivers'],
            'name'           => ['required', 'string', 'max:150'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'license_type'   => ['nullable', 'string', 'max:30'],
            'license_expiry' => ['nullable', 'date'],
            'status'         => ['nullable', 'in:Active,Inactive,On Leave'],
            'notes'          => ['nullable', 'string'],
        ]);

        $driver = Driver::create($data);
        return response()->json($driver, 201);
    }

    public function update(Request $request, Driver $driver): JsonResponse
    {
        $data = $request->validate([
            'name'           => ['sometimes', 'string', 'max:150'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'license_type'   => ['nullable', 'string', 'max:30'],
            'license_expiry' => ['nullable', 'date'],
            'status'         => ['nullable', 'in:Active,Inactive,On Leave'],
            'notes'          => ['nullable', 'string'],
        ]);

        $driver->update($data);
        return response()->json($driver->fresh());
    }

    public function destroy(Driver $driver): JsonResponse
    {
        // Unassign from vehicles before deleting
        $driver->vehicles()->update(['assigned_driver_id' => null]);
        $driver->delete();
        return response()->json(['message' => 'Driver deleted']);
    }
}
