<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionChecklistItem extends Model
{
    protected $table = 'vehicle_inspection_checklist_items';

    protected $fillable = [
        'checklist_id', 'check_item', 'category', 'result', 'technician_notes', 'photo_url',
    ];

    public function checklist()
    {
        return $this->belongsTo(InspectionChecklist::class, 'checklist_id');
    }
}
