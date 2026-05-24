<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\Sparepart;
use App\Modules\Vehicle\Models\SparepartStockLog;
use App\Modules\Vehicle\Services\StockManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SparepartController extends Controller
{
    public function __construct(private StockManagementService $stockService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Sparepart::orderBy('name');

        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(fn($q) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('sparepart_code', 'like', "%{$s}%")
                ->orWhere('category', 'like', "%{$s}%"));
        }

        if ($request->filled('category')) $query->where('category', $request->string('category'));
        if ($request->boolean('low_stock')) $query->whereRaw('stock_quantity <= minimum_stock');

        $perPage = min($request->integer('per_page', 20), 100);
        return response()->json($query->paginate($perPage));
    }

    public function show(Sparepart $sparepart): JsonResponse
    {
        $sparepart->load(['stockLogs' => fn($q) => $q->orderBy('created_at', 'desc')->limit(20)]);
        return response()->json($sparepart);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sparepart_code'            => ['required', 'string', 'max:50', 'unique:vehicle_spareparts'],
            'name'                      => ['required', 'string', 'max:200'],
            'category'                  => ['nullable', 'string', 'max:100'],
            'brand'                     => ['nullable', 'string', 'max:100'],
            'part_number'               => ['nullable', 'string', 'max:100'],
            'unit'                      => ['nullable', 'string', 'max:20'],
            'stock_quantity'            => ['nullable', 'numeric', 'min:0'],
            'minimum_stock'             => ['nullable', 'numeric', 'min:0'],
            'unit_price'                => ['nullable', 'numeric', 'min:0'],
            'supplier'                  => ['nullable', 'string', 'max:200'],
            'supplier_phone'            => ['nullable', 'string', 'max:30'],
            'replacement_interval_km'   => ['nullable', 'integer', 'min:0'],
            'replacement_interval_days' => ['nullable', 'integer', 'min:0'],
            'replacement_interval_hours'=> ['nullable', 'integer', 'min:0'],
            'location'                  => ['nullable', 'string', 'max:100'],
            'notes'                     => ['nullable', 'string'],
        ]);

        $sparepart = Sparepart::create($data);

        // Log initial stock if provided
        if (!empty($data['stock_quantity']) && $data['stock_quantity'] > 0) {
            SparepartStockLog::create([
                'sparepart_id'     => $sparepart->id,
                'type'             => 'In',
                'quantity'         => $data['stock_quantity'],
                'quantity_before'  => 0,
                'quantity_after'   => $data['stock_quantity'],
                'unit_price'       => $data['unit_price'] ?? 0,
                'reference'        => 'Initial Stock',
                'transaction_date' => now()->toDateString(),
            ]);
        }

        return response()->json($sparepart, 201);
    }

    public function update(Request $request, Sparepart $sparepart): JsonResponse
    {
        $data = $request->validate([
            'name'                      => ['sometimes', 'string', 'max:200'],
            'category'                  => ['nullable', 'string', 'max:100'],
            'brand'                     => ['nullable', 'string', 'max:100'],
            'part_number'               => ['nullable', 'string', 'max:100'],
            'unit'                      => ['nullable', 'string', 'max:20'],
            'minimum_stock'             => ['nullable', 'numeric', 'min:0'],
            'unit_price'                => ['nullable', 'numeric', 'min:0'],
            'supplier'                  => ['nullable', 'string', 'max:200'],
            'supplier_phone'            => ['nullable', 'string', 'max:30'],
            'replacement_interval_km'   => ['nullable', 'integer', 'min:0'],
            'replacement_interval_days' => ['nullable', 'integer', 'min:0'],
            'replacement_interval_hours'=> ['nullable', 'integer', 'min:0'],
            'location'                  => ['nullable', 'string', 'max:100'],
            'notes'                     => ['nullable', 'string'],
            'is_active'                 => ['nullable', 'boolean'],
        ]);

        $sparepart->update($data);
        return response()->json($sparepart->fresh());
    }

    public function destroy(Sparepart $sparepart): JsonResponse
    {
        $sparepart->delete();
        return response()->json(['message' => 'Sparepart deleted']);
    }

    public function addStock(Request $request, Sparepart $sparepart): JsonResponse
    {
        $data = $request->validate([
            'quantity'   => ['required', 'numeric', 'min:0.01'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'reference'  => ['nullable', 'string', 'max:100'],
            'supplier'   => ['nullable', 'string', 'max:200'],
            'notes'      => ['nullable', 'string'],
        ]);

        $log = $this->stockService->addStock(
            $sparepart,
            $data['quantity'],
            $data['unit_price'] ?? 0,
            $data['reference'] ?? '',
            $data['supplier'] ?? '',
            auth()->id(),
            $data['notes'] ?? ''
        );

        return response()->json(['message' => 'Stock added', 'log' => $log, 'sparepart' => $sparepart->fresh()]);
    }

    public function stockLogs(Sparepart $sparepart): JsonResponse
    {
        $logs = SparepartStockLog::where('sparepart_id', $sparepart->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return response()->json($logs);
    }

    public function lowStock(): JsonResponse
    {
        return response()->json($this->stockService->getLowStockItems());
    }

    public function categories(): JsonResponse
    {
        $cats = Sparepart::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category');
        return response()->json($cats);
    }
}
