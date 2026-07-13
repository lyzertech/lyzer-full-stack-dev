<?php

namespace App\Modules\System\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\System\Models\License;
use Illuminate\Http\JsonResponse;

class LicenseController extends Controller
{
    /**
     * Get current license status.
     * 
     * Returns information about the active license including
     * validity, expiration date, and remaining days.
     * 
     * Note: This endpoint always returns 200 OK, with valid: true/false
     * to indicate license status. The 403 status is reserved for 
     * CheckLicense middleware blocking protected resources.
     */
    public function status(): JsonResponse
    {
        $license = License::getCurrentLicense();

        if (!$license) {
            return response()->json([
                'valid' => false,
                'error' => 'license_required',
                'message' => 'No valid license found',
            ], 200);
        }

        return response()->json([
            'valid' => true,
            'expires_at' => $license->expires_at->toIso8601String(),
            'days_remaining' => $license->days_remaining,
            'license_type' => $license->license_type,
            'issued_to' => $license->issued_to,
            'is_expiring_soon' => $license->isExpiringSoon(),
        ]);
    }
}
