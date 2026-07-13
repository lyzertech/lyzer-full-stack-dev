<?php

namespace App\Modules\System\Models;

use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'system_licenses';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'license_key',
        'license_type',
        'issued_to',
        'issued_at',
        'expires_at',
        'is_active',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Scope a query to only include valid licenses.
     * Valid = is_active AND not expired
     */
    public function scopeValid($query)
    {
        return $query->where('is_active', true)
                     ->where('expires_at', '>', now());
    }

    /**
     * Check if the system has a valid license.
     */
    public static function hasValidLicense(): bool
    {
        return self::valid()->exists();
    }

    /**
     * Get the current valid license if exists.
     */
    public static function getCurrentLicense(): ?self
    {
        return self::valid()->first();
    }

    /**
     * Get days remaining until expiration.
     */
    public function getDaysRemainingAttribute(): int
    {
        if (!$this->expires_at) {
            return 0;
        }

        $now = now();
        if ($this->expires_at < $now) {
            return 0;
        }

        return (int) $now->diffInDays($this->expires_at, false);
    }

    /**
     * Check if license is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at < now();
    }

    /**
     * Check if license is about to expire (within 30 days).
     */
    public function isExpiringSoon(int $days = 30): bool
    {
        if ($this->isExpired()) {
            return false;
        }

        return $this->days_remaining <= $days;
    }
}
