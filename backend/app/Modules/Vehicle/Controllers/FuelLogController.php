<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\FuelLog;
use App\Modules\Vehicle\Models\Vehicle;
use App\Modules\Vehicle\Models\CostRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FuelLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FuelLog::with(['vehicle', 'driver'])->orderBy('fuel_date', 'desc');

        if ($request->filled('vehicle_id')) $query->where('vehicle_id', $request->integer('vehicle_id'));
        if ($request->filled('driver_id'))  $query->where('driver_id', $request->integer('driver_id'));
        if ($request->filled('start_date')) $query->where('fuel_date', '>=', $request->string('start_date'));
        if ($request->filled('end_date'))   $query->where('fuel_date', '<=', $request->string('end_date'));

        $perPage = min($request->integer('per_page', 20), 100);
        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'   => ['required', 'integer', 'exists:vehicles,id'],
            'driver_id'    => ['nullable', 'integer', 'exists:vehicle_drivers,id'],
            'fuel_date'    => ['required', 'date'],
            'odometer'     => ['required', 'numeric', 'min:0'],
            'liters'       => ['required', 'numeric', 'min:0.01'],
            'unit_price'   => ['nullable', 'numeric', 'min:0'],
            'fuel_type'    => ['nullable', 'string', 'max:50'],
            'fuel_station' => ['nullable', 'string', 'max:200'],
            'full_tank'    => ['nullable', 'boolean'],
            'notes'        => ['nullable', 'string'],
        ]);

        $data['total_cost'] = ($data['liters']) * ($data['unit_price'] ?? 0);
        $data['recorded_by'] = auth()->id();

        // Calculate km/L from previous log
        $previousLog = FuelLog::where('vehicle_id', $data['vehicle_id'])
            ->where('full_tank', 1)
            ->where('fuel_date', '<', $data['fuel_date'])
            ->orderBy('fuel_date', 'desc')
            ->first();

        if ($previousLog && isset($data['full_tank']) && $data['full_tank']) {
            $distance = $data['odometer'] - $previousLog->odometer;
            if ($distance > 0) {
                $data['previous_odometer']   = $previousLog->odometer;
                $data['distance_since_last'] = $distance;
                $data['km_per_liter']        = round($distance / $data['liters'], 2);
            }
        }

        $fuelLog = FuelLog::create($data);

        // Update vehicle odometer if newer
        $vehicle = Vehicle::find($data['vehicle_id']);
        if ($vehicle && $data['odometer'] > $vehicle->odometer) {
            $vehicle->update(['odometer' => $data['odometer']]);
        }

        // Log fuel cost
        CostRecord::create([
            'vehicle_id'  => $data['vehicle_id'],
            'cost_date'   => $data['fuel_date'],
            'cost_type'   => 'Fuel',
            'amount'      => $data['total_cost'],
            'description' => "Fuel: {$data['liters']}L at " . ($data['fuel_station'] ?? 'N/A'),
            'recorded_by' => auth()->id(),
        ]);

        $fuelLog->load(['vehicle', 'driver']);
        return response()->json($fuelLog, 201);
    }

    public function update(Request $request, FuelLog $fuelLog): JsonResponse
    {
        $data = $request->validate([
            'fuel_date'    => ['sometimes', 'date'],
            'odometer'     => ['sometimes', 'numeric', 'min:0'],
            'liters'       => ['sometimes', 'numeric', 'min:0.01'],
            'unit_price'   => ['nullable', 'numeric', 'min:0'],
            'fuel_type'    => ['nullable', 'string', 'max:50'],
            'fuel_station' => ['nullable', 'string', 'max:200'],
            'notes'        => ['nullable', 'string'],
        ]);

        if (isset($data['liters']) || isset($data['unit_price'])) {
            $liters = $data['liters'] ?? $fuelLog->liters;
            $price  = $data['unit_price'] ?? $fuelLog->unit_price;
            $data['total_cost'] = $liters * $price;
        }

        $fuelLog->update($data);
        return response()->json($fuelLog->fresh(['vehicle', 'driver']));
    }

    public function destroy(FuelLog $fuelLog): JsonResponse
    {
        $fuelLog->delete();
        return response()->json(['message' => 'Fuel log deleted']);
    }

    public function analytics(Request $request): JsonResponse
    {
        $vehicleId = $request->integer('vehicle_id');
        $months    = $request->integer('months', 6);

        $query = "
            SELECT
                DATE_FORMAT(fuel_date, '%Y-%m') as month,
                SUM(liters) as total_liters,
                SUM(total_cost) as total_cost,
                AVG(km_per_liter) as avg_km_per_liter,
                COUNT(*) as fill_count
            FROM vehicle_fuel_logs
            WHERE fuel_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        ";
        $params = [$months];

        if ($vehicleId) {
            $query .= ' AND vehicle_id = ?';
            $params[] = $vehicleId;
        }

        $query .= ' GROUP BY DATE_FORMAT(fuel_date, \'%Y-%m\') ORDER BY month ASC';

        return response()->json(DB::select($query, $params));
    }
}
