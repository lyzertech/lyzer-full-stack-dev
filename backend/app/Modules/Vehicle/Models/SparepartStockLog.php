<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;

class SparepartStockLog extends Model
{
    protected $table = 'vehicle_sparepart_stock_logs';

    protected $fillable = [
        'sparepart_id', 'type', 'quantity', 'quantity_before',
        'quantity_after', 'unit_price', 'work_order_id', 'reference',
        'supplier', 'transaction_date', 'recorded_by', 'notes',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'quantity'         => 'float',
        'quantity_before'  => 'float',
        'quantity_after'   => 'float',
        'unit_price'       => 'float',
    ];

    public function sparepart()
    {
        return $this->belongsTo(Sparepart::class, 'sparepart_id');
    }
}
