<?php

namespace App\Modules\Monitoring\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Device extends Model
{
    use SoftDeletes;

    protected $table = 'monitoring_devices';

    protected $fillable = [
        'facility_id',
        'name',
        'device_code',
        'device_type',
        'brand',
        'model',
        'firmware_version',
        'ip_address',
        'mac_address',
        'connection_type',
        'protocol',
        'protocol_config',
        'status',
        'signal_strength',
        'last_heartbeat_at',
        'metadata'
    ];

    protected $casts = [
        'protocol_config' => 'array',
        'metadata' => 'array',
        'last_heartbeat_at' => 'datetime',
        'signal_strength' => 'integer',
    ];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'facility_id');
    }
}
