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

    protected $appends = ['dynamic_status'];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class, 'facility_id');
    }

    /**
     * Get dynamic status based on recent telemetry data from monitoring_acuvim
     */
    public function getDynamicStatusAttribute(): string
    {
        // Check if there's recent telemetry data in monitoring_acuvim table
        $hasRecentData = Acuvim::hasRecentData($this->name, $this->device_code, 30);
        
        if ($hasRecentData) {
            return 'Online';
        }
        
        // Check if there's any historical data but not recent (older than 30 minutes)
        $hasAnyData = Acuvim::where('device_name', $this->name)
            ->where('device_serial', $this->device_code)
            ->exists();
            
        if ($hasAnyData) {
            return 'Offline';
        }
        
        // No telemetry data found, return the stored status or Inactive as fallback
        return $this->status ?? 'Inactive';
    }

    /**
     * Get the latest telemetry timestamp for this device
     */
    public function getLatestTelemetryTimestamp()
    {
        $latest = Acuvim::getLatestForDevice($this->name, $this->device_code);
        return $latest ? $latest->Timestamp : null;
    }
}
