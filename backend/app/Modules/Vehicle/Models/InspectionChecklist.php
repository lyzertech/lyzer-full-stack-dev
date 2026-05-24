<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InspectionChecklist extends Model
{
    use SoftDeletes;

    protected $table = 'vehicle_inspection_checklists';

    protected $fillable = [
        'checklist_number', 'vehicle_id', 'driver_id', 'inspector_id',
        'inspection_date', 'inspection_type', 'odometer', 'overall_status',
        'health_score', 'general_notes',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'odometer'        => 'float',
        'health_score'    => 'integer',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }

    public function items()
    {
        return $this->hasMany(InspectionChecklistItem::class, 'checklist_id');
    }
}
