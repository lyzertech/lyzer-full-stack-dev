<?php

namespace App\Modules\Monitoring\Models;

use Illuminate\Database\Eloquent\Model;

class Acuvim extends Model
{
    protected $table = 'monitoring_acuvim';

    protected $fillable = [
        'gateway_name',
        'gateway_model', 
        'gateway_serial',
        'device_name',
        'device_model',
        'device_serial',
        'device_online',
        'Timestamp',
        // Add other fields as needed
    ];

    protected $casts = [
        'Timestamp' => 'datetime',
        'device_online' => 'boolean',
    ];

    /**
     * Get the latest telemetry data for a device
     */
    public static function getLatestForDevice($deviceName, $deviceSerial)
    {
        return static::where('device_name', $deviceName)
            ->where('device_serial', $deviceSerial)
            ->orderBy('Timestamp', 'desc')
            ->first();
    }

    /**
     * Check if device has recent data (within last 30 minutes)
     */
    public static function hasRecentData($deviceName, $deviceSerial, $minutesThreshold = 30)
    {
        $threshold = now()->subMinutes($minutesThreshold);
        
        return static::where('device_name', $deviceName)
            ->where('device_serial', $deviceSerial)
            ->where('Timestamp', '>=', $threshold)
            ->exists();
    }
}