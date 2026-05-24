<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sparepart extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehicle_spareparts';

    protected $fillable = [
        'sparepart_code', 'name', 'category', 'brand', 'part_number',
        'unit', 'stock_quantity', 'minimum_stock', 'unit_price',
        'supplier', 'supplier_phone', 'replacement_interval_km',
        'replacement_interval_days', 'replacement_interval_hours',
        'compatible_vehicle_types', 'location', 'notes', 'is_active',
    ];

    protected $casts = [
        'stock_quantity'             => 'float',
        'minimum_stock'              => 'float',
        'unit_price'                 => 'float',
        'is_active'                  => 'boolean',
    ];

    public function stockLogs()
    {
        return $this->hasMany(SparepartStockLog::class, 'sparepart_id');
    }

    public function workOrderItems()
    {
        return $this->hasMany(WorkOrderItem::class, 'sparepart_id');
    }

    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->minimum_stock;
    }
}
