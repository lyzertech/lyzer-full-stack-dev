<?php

namespace App\Modules\Monitoring\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use SoftDeletes;

    protected $table = 'monitoring_organizations';

    protected $fillable = [
        'name',
        'slug',
        'code',
        'industry',
        'headquarters_address',
        'website',
        'contact_email',
        'contact_phone',
        'tier',
        'status',
        'logo_url',
        'metadata',
        'is_active'
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function facilities(): HasMany
    {
        return $this->hasMany(Facility::class, 'organization_id');
    }

    public function devices(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(Device::class, Facility::class, 'organization_id', 'facility_id');
    }
}
