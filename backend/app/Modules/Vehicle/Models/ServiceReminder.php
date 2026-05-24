<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceReminder extends Model
{
    protected $table = 'vehicle_service_reminders';

    protected $fillable = [
        'vehicle_id', 'service_schedule_id', 'reminder_type', 'title',
        'description', 'due_odometer', 'due_date', 'due_hours', 'status',
        'advance_notice_days', 'advance_notice_km', 'notification_sent',
        'completed_at', 'completed_work_order_id',
    ];

    protected $casts = [
        'due_date'           => 'date',
        'due_odometer'       => 'float',
        'notification_sent'  => 'boolean',
        'completed_at'       => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function schedule()
    {
        return $this->belongsTo(ServiceSchedule::class, 'service_schedule_id');
    }
}
