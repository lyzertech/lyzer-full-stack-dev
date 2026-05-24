<?php

namespace App\Modules\Monitoring\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facility extends Model
{
    use SoftDeletes;

    protected $table = 'monitoring_facilities';

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'location_name',
        'full_address',
        'facility_type',
        'manager_name',
        'manager_email',
        'manager_phone',
        'latitude',
        'longitude',
        'status',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'facility_id');
    }
}
