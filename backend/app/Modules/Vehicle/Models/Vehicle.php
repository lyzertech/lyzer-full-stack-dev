<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehicles';

    protected $fillable = [
        'vehicle_code', 'plate_number', 'brand', 'model', 'year',
        'vin_number', 'engine_number', 'vehicle_type_id', 'fuel_type',
        'transmission', 'odometer', 'odometer_unit', 'purchase_date',
        'purchase_price', 'insurance_expiry', 'insurance_number',
        'registration_expiry', 'registration_number', 'assigned_driver_id',
        'photo_url', 'status', 'location', 'department', 'notes', 'qr_code',
    ];

    protected $casts = [
        'purchase_date'       => 'date',
        'insurance_expiry'    => 'date',
        'registration_expiry' => 'date',
        'odometer'            => 'float',
        'purchase_price'      => 'float',
        'year'                => 'integer',
    ];

    public function vehicleType()
    {
        return $this->belongsTo(VehicleType::class, 'vehicle_type_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'assigned_driver_id');
    }

    public function serviceSchedules()
    {
        return $this->hasMany(ServiceSchedule::class, 'vehicle_id');
    }

    public function serviceReminders()
    {
        return $this->hasMany(ServiceReminder::class, 'vehicle_id');
    }

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class, 'vehicle_id');
    }

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class, 'vehicle_id');
    }

    public function inspections()
    {
        return $this->hasMany(InspectionChecklist::class, 'vehicle_id');
    }

    public function costRecords()
    {
        return $this->hasMany(CostRecord::class, 'vehicle_id');
    }

    public function attachments()
    {
        return $this->morphMany(VehicleAttachment::class, 'attachable');
    }
}
