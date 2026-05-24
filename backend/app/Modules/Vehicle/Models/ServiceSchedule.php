<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceSchedule extends Model
{
    use SoftDeletes;

    protected $table = 'vehicle_service_schedules';

    protected $fillable = [
        'vehicle_id', 'vehicle_type_id', 'service_name', 'description',
        'trigger_type', 'interval_km', 'interval_days', 'interval_hours',
        'last_service_odometer', 'last_service_date', 'last_service_hours',
        'next_due_odometer', 'next_due_date', 'next_due_hours', 'is_active',
    ];

    protected $casts = [
        'last_service_date'    => 'date',
        'next_due_date'        => 'date',
        'is_active'            => 'boolean',
        'last_service_odometer' => 'float',
        'next_due_odometer'    => 'float',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }
}
