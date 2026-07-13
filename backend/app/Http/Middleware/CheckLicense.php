<?php

namespace App\Http\Middleware;

use App\Modules\System\Models\License;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckLicense
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Check if license validation is cached (5 minutes TTL)
            $hasValidLicense = Cache::remember('system_has_valid_license', 300, function () {
                try {
                    return License::hasValidLicense();
                } catch (\Exception $e) {
                    // If table doesn't exist or any DB error, treat as no license
                    \Log::warning('License check failed: ' . $e->getMessage());
                    return false;
                }
            });

            if (!$hasValidLicense) {
                return response()->json([
                    'error' => 'license_required',
                    'message' => 'Valid license required to access this application',
                    'status' => 403,
                ], 403);
            }

            return $next($request);
        } catch (\Exception $e) {
            // Catch any unexpected errors and return license required
            \Log::error('License middleware error: ' . $e->getMessage());
            return response()->json([
                'error' => 'license_required',
                'message' => 'Valid license required to access this application',
                'status' => 403,
            ], 403);
        }
    }
}
