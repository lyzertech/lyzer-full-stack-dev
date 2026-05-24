<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehicle_types';

    protected $fillable = [
        'name', 'category', 'brand', 'model',
        'default_oil_interval_km', 'default_oil_interval_days',
        'default_service_interval_km', 'default_service_interval_days',
        'default_service_interval_hours', 'notes', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'vehicle_type_id');
    }
}
