<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    use SoftDeletes;

    protected $table = 'vehicle_work_orders';

    protected $fillable = [
        'work_order_number', 'vehicle_id', 'vendor_id', 'assigned_technician_id',
        'service_date', 'completion_date', 'odometer_in', 'odometer_out',
        'service_type', 'complaint', 'diagnosis', 'action_taken',
        'labor_cost', 'sparepart_cost', 'other_cost', 'total_cost',
        'status', 'approved_by', 'approved_at', 'notes',
    ];

    protected $casts = [
        'service_date'    => 'date',
        'completion_date' => 'date',
        'approved_at'     => 'datetime',
        'labor_cost'      => 'float',
        'sparepart_cost'  => 'float',
        'other_cost'      => 'float',
        'total_cost'      => 'float',
        'odometer_in'     => 'float',
        'odometer_out'    => 'float',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function items()
    {
        return $this->hasMany(WorkOrderItem::class, 'work_order_id');
    }

    public function attachments()
    {
        return $this->morphMany(VehicleAttachment::class, 'attachable');
    }
}
