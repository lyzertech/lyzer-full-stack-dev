<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\Vehicle;
use App\Modules\Vehicle\Services\ReminderCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VehicleController extends Controller
{
    public function __construct(private ReminderCalculationService $reminderService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::with(['vehicleType', 'driver'])
            ->orderBy('vehicle_code');

        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(function ($q) use ($s) {
                $q->where('vehicle_code', 'like', "%{$s}%")
                  ->orWhere('plate_number', 'like', "%{$s}%")
                  ->orWhere('brand', 'like', "%{$s}%")
                  ->orWhere('model', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('vehicle_type_id')) {
            $query->where('vehicle_type_id', $request->integer('vehicle_type_id'));
        }

        if ($request->filled('fuel_type')) {
            $query->where('fuel_type', $request->string('fuel_type'));
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $vehicles = $query->paginate($perPage);

        return response()->json($vehicles);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        $vehicle->load([
            'vehicleType', 'driver',
            'serviceReminders' => fn($q) => $q->whereNotIn('status', ['completed', 'dismissed'])->orderBy('due_date'),
            'workOrders' => fn($q) => $q->orderBy('service_date', 'desc')->limit(5),
            'fuelLogs' => fn($q) => $q->orderBy('fuel_date', 'desc')->limit(5),
        ]);

        return response()->json($vehicle);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_code'         => ['required', 'string', 'max:50', 'unique:vehicles'],
            'plate_number'         => ['nullable', 'string', 'max:30'],
            'brand'                => ['nullable', 'string', 'max:100'],
            'model'                => ['nullable', 'string', 'max:100'],
            'year'                 => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'vin_number'           => ['nullable', 'string', 'max:100'],
            'engine_number'        => ['nullable', 'string', 'max:100'],
            'vehicle_type_id'      => ['nullable', 'integer', 'exists:vehicle_types,id'],
            'fuel_type'            => ['nullable', 'in:Gasoline,Diesel,Electric,Hybrid,LPG,Other'],
            'transmission'         => ['nullable', 'in:Manual,Automatic,CVT,Semi-Auto'],
            'odometer'             => ['nullable', 'numeric', 'min:0'],
            'odometer_unit'        => ['nullable', 'in:km,hours'],
            'purchase_date'        => ['nullable', 'date'],
            'purchase_price'       => ['nullable', 'numeric', 'min:0'],
            'insurance_expiry'     => ['nullable', 'date'],
            'insurance_number'     => ['nullable', 'string', 'max:100'],
            'registration_expiry'  => ['nullable', 'date'],
            'registration_number'  => ['nullable', 'string', 'max:100'],
            'assigned_driver_id'   => ['nullable', 'integer', 'exists:vehicle_drivers,id'],
            'status'               => ['nullable', 'in:Active,Maintenance,Breakdown,Retired'],
            'location'             => ['nullable', 'string', 'max:200'],
            'department'           => ['nullable', 'string', 'max:100'],
            'notes'                => ['nullable', 'string'],
        ]);

        // Generate QR code data
        $data['qr_code'] = 'VH-' . Str::upper(Str::random(8));

        $vehicle = Vehicle::create($data);

        // Initialize document reminders
        $this->reminderService->refreshDocumentReminders($vehicle);

        $vehicle->load(['vehicleType', 'driver']);

        return response()->json($vehicle, 201);
    }

    public function update(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'vehicle_code'         => ['sometimes', 'string', 'max:50', 'unique:vehicles,vehicle_code,' . $vehicle->id],
            'plate_number'         => ['nullable', 'string', 'max:30'],
            'brand'                => ['nullable', 'string', 'max:100'],
            'model'                => ['nullable', 'string', 'max:100'],
            'year'                 => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'vin_number'           => ['nullable', 'string', 'max:100'],
            'engine_number'        => ['nullable', 'string', 'max:100'],
            'vehicle_type_id'      => ['nullable', 'integer', 'exists:vehicle_types,id'],
            'fuel_type'            => ['nullable', 'in:Gasoline,Diesel,Electric,Hybrid,LPG,Other'],
            'transmission'         => ['nullable', 'in:Manual,Automatic,CVT,Semi-Auto'],
            'odometer'             => ['nullable', 'numeric', 'min:0'],
            'odometer_unit'        => ['nullable', 'in:km,hours'],
            'purchase_date'        => ['nullable', 'date'],
            'purchase_price'       => ['nullable', 'numeric', 'min:0'],
            'insurance_expiry'     => ['nullable', 'date'],
            'insurance_number'     => ['nullable', 'string', 'max:100'],
            'registration_expiry'  => ['nullable', 'date'],
            'registration_number'  => ['nullable', 'string', 'max:100'],
            'assigned_driver_id'   => ['nullable', 'integer', 'exists:vehicle_drivers,id'],
            'status'               => ['nullable', 'in:Active,Maintenance,Breakdown,Retired'],
            'location'             => ['nullable', 'string', 'max:200'],
            'department'           => ['nullable', 'string', 'max:100'],
            'notes'                => ['nullable', 'string'],
        ]);

        $vehicle->update($data);

        // Refresh reminders if expiry dates changed
        $this->reminderService->refreshDocumentReminders($vehicle->fresh());

        $vehicle->load(['vehicleType', 'driver']);

        return response()->json($vehicle);
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $vehicle->delete();
        return response()->json(['message' => 'Vehicle deleted successfully']);
    }

    public function updateOdometer(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'odometer' => ['required', 'numeric', 'min:0'],
        ]);

        $vehicle->update($data);

        // Recalculate mileage-based reminders
        $this->reminderService->recalculateForVehicle($vehicle->fresh());

        return response()->json(['message' => 'Odometer updated', 'vehicle' => $vehicle->fresh()]);
    }
}
