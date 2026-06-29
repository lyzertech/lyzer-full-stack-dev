<?php

namespace App\Modules\Monitoring\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MonitoringCache
{
    public const TTL_SECONDS = 45;

    public static function version(): string
    {
        return (string) Cache::get('monitoring:cache-version', '1');
    }

    public static function bump(): void
    {
        Cache::put('monitoring:cache-version', (string) microtime(true), 86400);
    }

    public static function deviceTreeKey(): string
    {
        return 'monitoring:v' . self::version() . ':device-tree';
    }

    public static function facilitiesKey(int $organizationId): string
    {
        return 'monitoring:v' . self::version() . ':facilities:' . $organizationId;
    }

    public static function deviceScopeKey(Request $request): string
    {
        $parts = [
            'org' => $request->input('organization_id', ''),
            'facility' => $request->input('facility_id', ''),
            'search' => mb_strtolower(trim((string) $request->input('search', ''))),
        ];

        return 'monitoring:v' . self::version() . ':device-scope:' . sha1(json_encode($parts));
    }
}
