<?php

namespace App\Modules\Vehicle\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehicle_vendors';

    protected $fillable = [
        'vendor_code', 'workshop_name', 'contact_person', 'phone',
        'email', 'address', 'city', 'vendor_type', 'rating',
        'service_notes', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'rating' => 'integer',
    ];

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class, 'vendor_id');
    }
}
