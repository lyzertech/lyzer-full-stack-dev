<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\WorkOrder;
use App\Modules\Vehicle\Models\WorkOrderItem;
use App\Modules\Vehicle\Models\Vehicle;
use App\Modules\Vehicle\Models\CostRecord;
use App\Modules\Vehicle\Services\StockManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WorkOrderController extends Controller
{
    public function __construct(private StockManagementService $stockService) {}

    public function index(Request $request): JsonResponse
    {
        $query = WorkOrder::with(['vehicle', 'vendor'])
            ->orderBy('service_date', 'desc');

        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(function ($q) use ($s) {
                $q->where('work_order_number', 'like', "%{$s}%")
                  ->orWhereHas('vehicle', fn($vq) => $vq->where('vehicle_code', 'like', "%{$s}%")
                      ->orWhere('plate_number', 'like', "%{$s}%"));
            });
        }

        if ($request->filled('status'))       $query->where('status', $request->string('status'));
        if ($request->filled('service_type')) $query->where('service_type', $request->string('service_type'));
        if ($request->filled('vehicle_id'))   $query->where('vehicle_id', $request->integer('vehicle_id'));
        if ($request->filled('start_date'))   $query->where('service_date', '>=', $request->string('start_date'));
        if ($request->filled('end_date'))     $query->where('service_date', '<=', $request->string('end_date'));

        $perPage = min($request->integer('per_page', 15), 100);
        return response()->json($query->paginate($perPage));
    }

    public function show(WorkOrder $workOrder): JsonResponse
    {
        $workOrder->load(['vehicle.vehicleType', 'vendor', 'items.sparepart']);
        return response()->json($workOrder);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'vehicle_id'             => ['required', 'integer', 'exists:vehicles,id'],
            'vendor_id'              => ['nullable', 'integer', 'exists:vehicle_vendors,id'],
            'assigned_technician_id' => ['nullable', 'integer'],
            'service_date'           => ['required', 'date'],
            'odometer_in'            => ['nullable', 'numeric', 'min:0'],
            'service_type'           => ['nullable', 'in:Preventive,Corrective,Emergency,Inspection'],
            'complaint'              => ['nullable', 'string'],
            'diagnosis'              => ['nullable', 'string'],
            'action_taken'           => ['nullable', 'string'],
            'labor_cost'             => ['nullable', 'numeric', 'min:0'],
            'other_cost'             => ['nullable', 'numeric', 'min:0'],
            'notes'                  => ['nullable', 'string'],
            'items'                  => ['nullable', 'array'],
            'items.*.item_name'      => ['required_with:items', 'string', 'max:200'],
            'items.*.item_type'      => ['nullable', 'in:sparepart,labor,other'],
            'items.*.sparepart_id'   => ['nullable', 'integer', 'exists:vehicle_spareparts,id'],
            'items.*.quantity'       => ['nullable', 'numeric', 'min:0'],
            'items.*.unit_price'     => ['nullable', 'numeric', 'min:0'],
        ]);

        return DB::transaction(function () use ($data) {
            // Generate WO number
            $year = Carbon::now()->format('Y');
            $month = Carbon::now()->format('m');
            $last = WorkOrder::whereYear('created_at', $year)->count() + 1;
            $data['work_order_number'] = "WO-{$year}{$month}-" . str_pad($last, 4, '0', STR_PAD_LEFT);
            $data['status'] = 'Draft';

            // Calculate costs
            $sparepartCost = 0;
            if (!empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    $sparepartCost += ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0);
                }
            }
            $data['sparepart_cost'] = $sparepartCost;
            $data['total_cost'] = ($data['labor_cost'] ?? 0) + $sparepartCost + ($data['other_cost'] ?? 0);

            $workOrder = WorkOrder::create($data);

            // Create items
            if (!empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    $qty = $item['quantity'] ?? 1;
                    $price = $item['unit_price'] ?? 0;
                    WorkOrderItem::create([
                        'work_order_id' => $workOrder->id,
                        'sparepart_id'  => $item['sparepart_id'] ?? null,
                        'item_name'     => $item['item_name'],
                        'item_type'     => $item['item_type'] ?? 'sparepart',
                        'quantity'      => $qty,
                        'unit'          => $item['unit'] ?? 'pcs',
                        'unit_price'    => $price,
                        'total_price'   => $qty * $price,
                        'notes'         => $item['notes'] ?? null,
                    ]);
                }
            }

            $workOrder->load(['vehicle', 'vendor', 'items.sparepart']);
            return response()->json($workOrder, 201);
        });
    }

    public function update(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $data = $request->validate([
            'vendor_id'       => ['nullable', 'integer', 'exists:vehicle_vendors,id'],
            'service_date'    => ['sometimes', 'date'],
            'completion_date' => ['nullable', 'date'],
            'odometer_in'     => ['nullable', 'numeric', 'min:0'],
            'odometer_out'    => ['nullable', 'numeric', 'min:0'],
            'service_type'    => ['nullable', 'in:Preventive,Corrective,Emergency,Inspection'],
            'complaint'       => ['nullable', 'string'],
            'diagnosis'       => ['nullable', 'string'],
            'action_taken'    => ['nullable', 'string'],
            'labor_cost'      => ['nullable', 'numeric', 'min:0'],
            'sparepart_cost'  => ['nullable', 'numeric', 'min:0'],
            'other_cost'      => ['nullable', 'numeric', 'min:0'],
            'status'          => ['nullable', 'in:Draft,Pending,In Progress,Completed,Cancelled'],
            'notes'           => ['nullable', 'string'],
        ]);

        $data['total_cost'] = ($data['labor_cost'] ?? $workOrder->labor_cost)
            + ($data['sparepart_cost'] ?? $workOrder->sparepart_cost)
            + ($data['other_cost'] ?? $workOrder->other_cost);

        $previousStatus = $workOrder->status;
        $workOrder->update($data);

        // Auto-deduct stock when completed
        if ($data['status'] === 'Completed' && $previousStatus !== 'Completed') {
            $this->stockService->processWorkOrderDeductions($workOrder->id);

            // Log cost record
            CostRecord::create([
                'vehicle_id'    => $workOrder->vehicle_id,
                'work_order_id' => $workOrder->id,
                'cost_date'     => $workOrder->completion_date ?? $workOrder->service_date,
                'cost_type'     => 'Maintenance',
                'amount'        => $workOrder->total_cost,
                'description'   => "Work Order #{$workOrder->work_order_number}",
                'vendor'        => $workOrder->vendor?->workshop_name,
            ]);

            // Update vehicle odometer
            if ($workOrder->odometer_out) {
                $workOrder->vehicle->update(['odometer' => $workOrder->odometer_out]);
            }
        }

        $workOrder->load(['vehicle', 'vendor', 'items.sparepart']);
        return response()->json($workOrder);
    }

    public function destroy(WorkOrder $workOrder): JsonResponse
    {
        if ($workOrder->status === 'Completed') {
            return response()->json(['error' => 'Cannot delete a completed work order.'], 422);
        }
        $workOrder->delete();
        return response()->json(['message' => 'Work order deleted']);
    }

    public function approve(WorkOrder $workOrder): JsonResponse
    {
        if ($workOrder->status !== 'Pending') {
            return response()->json(['error' => 'Only Pending work orders can be approved.'], 422);
        }
        $workOrder->update([
            'status'      => 'In Progress',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);
        return response()->json($workOrder->fresh());
    }
}
