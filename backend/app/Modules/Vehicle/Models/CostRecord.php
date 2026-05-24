<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;

class CostRecord extends Model
{
    protected $table = 'vehicle_cost_records';

    protected $fillable = [
        'vehicle_id', 'work_order_id', 'cost_date', 'cost_type',
        'amount', 'description', 'vendor', 'reference', 'recorded_by', 'notes',
    ];

    protected $casts = [
        'cost_date' => 'date',
        'amount'    => 'float',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }
}
