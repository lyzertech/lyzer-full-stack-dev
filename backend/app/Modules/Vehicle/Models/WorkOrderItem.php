<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrderItem extends Model
{
    protected $table = 'vehicle_work_order_items';

    protected $fillable = [
        'work_order_id', 'sparepart_id', 'item_name', 'item_type',
        'quantity', 'unit', 'unit_price', 'total_price', 'notes',
    ];

    protected $casts = [
        'quantity'    => 'float',
        'unit_price'  => 'float',
        'total_price' => 'float',
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'work_order_id');
    }

    public function sparepart()
    {
        return $this->belongsTo(Sparepart::class, 'sparepart_id');
    }
}
