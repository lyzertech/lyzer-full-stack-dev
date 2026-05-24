<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelLog extends Model
{
    use SoftDeletes;

    protected $table = 'vehicle_fuel_logs';

    protected $fillable = [
        'vehicle_id', 'driver_id', 'fuel_date', 'odometer', 'liters',
        'unit_price', 'total_cost', 'fuel_type', 'fuel_station',
        'km_per_liter', 'previous_odometer', 'distance_since_last',
        'full_tank', 'notes', 'recorded_by',
    ];

    protected $casts = [
        'fuel_date'            => 'date',
        'odometer'             => 'float',
        'liters'               => 'float',
        'unit_price'           => 'float',
        'total_cost'           => 'float',
        'km_per_liter'         => 'float',
        'previous_odometer'    => 'float',
        'distance_since_last'  => 'float',
        'full_tank'            => 'boolean',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }
}
