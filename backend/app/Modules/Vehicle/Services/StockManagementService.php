<?php

namespace App\Modules\Vehicle\Services;

use App\Modules\Vehicle\Models\Sparepart;
use App\Modules\Vehicle\Models\SparepartStockLog;
use App\Modules\Vehicle\Models\WorkOrderItem;
use Illuminate\Support\Facades\DB;

class StockManagementService
{
    /**
     * Add stock (purchase / receipt).
     */
    public function addStock(
        Sparepart $sparepart,
        float $quantity,
        float $unitPrice = 0,
        string $reference = '',
        string $supplier = '',
        ?int $recordedBy = null,
        string $notes = ''
    ): SparepartStockLog {
        return DB::transaction(function () use ($sparepart, $quantity, $unitPrice, $reference, $supplier, $recordedBy, $notes) {
            $before = (float) $sparepart->stock_quantity;
            $after  = $before + $quantity;

            $sparepart->update(['stock_quantity' => $after]);

            return SparepartStockLog::create([
                'sparepart_id'     => $sparepart->id,
                'type'             => 'In',
                'quantity'         => $quantity,
                'quantity_before'  => $before,
                'quantity_after'   => $after,
                'unit_price'       => $unitPrice,
                'reference'        => $reference,
                'supplier'         => $supplier,
                'transaction_date' => now()->toDateString(),
                'recorded_by'      => $recordedBy,
                'notes'            => $notes,
            ]);
        });
    }

    /**
     * Deduct stock (usage in work order).
     */
    public function deductStock(
        Sparepart $sparepart,
        float $quantity,
        ?int $workOrderId = null,
        ?int $recordedBy = null,
        string $notes = ''
    ): SparepartStockLog {
        return DB::transaction(function () use ($sparepart, $quantity, $workOrderId, $recordedBy, $notes) {
            $before = (float) $sparepart->stock_quantity;
            $after  = max(0, $before - $quantity);

            $sparepart->update(['stock_quantity' => $after]);

            return SparepartStockLog::create([
                'sparepart_id'     => $sparepart->id,
                'type'             => 'Out',
                'quantity'         => $quantity,
                'quantity_before'  => $before,
                'quantity_after'   => $after,
                'work_order_id'    => $workOrderId,
                'transaction_date' => now()->toDateString(),
                'recorded_by'      => $recordedBy,
                'notes'            => $notes,
            ]);
        });
    }

    /**
     * Auto-deduct all sparepart items from a completed work order.
     */
    public function processWorkOrderDeductions(int $workOrderId, ?int $recordedBy = null): void
    {
        $items = WorkOrderItem::where('work_order_id', $workOrderId)
            ->where('item_type', 'sparepart')
            ->whereNotNull('sparepart_id')
            ->with('sparepart')
            ->get();

        foreach ($items as $item) {
            if ($item->sparepart) {
                $this->deductStock(
                    $item->sparepart,
                    $item->quantity,
                    $workOrderId,
                    $recordedBy,
                    "Auto-deducted from Work Order #{$workOrderId}"
                );
            }
        }
    }

    /**
     * Get all spareparts below minimum stock.
     */
    public function getLowStockItems(): \Illuminate\Database\Eloquent\Collection
    {
        return Sparepart::whereRaw('stock_quantity <= minimum_stock')
            ->where('is_active', 1)
            ->orderByRaw('stock_quantity - minimum_stock ASC')
            ->get();
    }
}
