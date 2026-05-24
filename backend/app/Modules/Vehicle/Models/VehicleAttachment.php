<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleAttachment extends Model
{
    protected $table = 'vehicle_attachments';

    protected $fillable = [
        'attachable_type', 'attachable_id', 'file_name', 'file_url',
        'file_type', 'file_size', 'category', 'description', 'uploaded_by',
    ];

    public function attachable()
    {
        return $this->morphTo();
    }
}
