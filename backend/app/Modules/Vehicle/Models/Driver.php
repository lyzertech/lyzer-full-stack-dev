<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehicle_drivers';

    protected $fillable = [
        'employee_code', 'name', 'phone', 'email',
        'license_number', 'license_type', 'license_expiry',
        'status', 'photo_url', 'notes',
    ];

    protected $casts = [
        'license_expiry' => 'date',
    ];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'assigned_driver_id');
    }

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class, 'driver_id');
    }
}
