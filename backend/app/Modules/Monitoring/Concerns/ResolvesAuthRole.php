<?php

namespace App\Modules\Monitoring\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait ResolvesAuthRole
{
    private function activeRoleSlugForUser(int $userId): string
    {
        $roleRecord = DB::table('auth_user_roles')
            ->join('auth_roles', 'auth_user_roles.role_id', '=', 'auth_roles.id')
            ->where('auth_user_roles.user_id', $userId)
            ->where('auth_user_roles.is_active', 1)
            ->select('auth_roles.slug')
            ->first();

        return $roleRecord ? (string) $roleRecord->slug : 'user';
    }

    private function isMonitoringViewOnlyRole(string $roleSlug): bool
    {
        $normalized = strtolower($roleSlug);

        return in_array($normalized, ['monitoring-view', 'monitoring_view'], true)
            || str_contains($normalized, 'monitoring-view');
    }

    /**
     * Block create/store for read-only monitoring view roles.
     */
    private function denyIfMonitoringViewOnly(Request $request): ?JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        if ($this->isMonitoringViewOnlyRole($this->activeRoleSlugForUser((int) $user->id))) {
            return response()->json([
                'message' => 'Forbidden. Monitoring view role cannot create installation resources.',
            ], 403);
        }

        return null;
    }
}
