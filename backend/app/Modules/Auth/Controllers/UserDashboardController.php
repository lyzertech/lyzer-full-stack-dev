<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserDashboardController extends Controller
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

    private function isMonitoringRoleSlug(string $roleSlug): bool
    {
        $normalized = strtolower($roleSlug);

        return $normalized === 'monitoring' || str_contains($normalized, 'monitoring');
    }

    /**
     * Active roles from auth_roles with user counts from auth_user_roles + auth_users.
     *
     * @see database/migrations/2026_04_02_000002_create_auth_roles_table.php
     */
    public function usersByRole(Request $request): JsonResponse
    {
        $query = DB::table('auth_roles')
            ->leftJoin('auth_user_roles', function ($join) {
                $join->on('auth_roles.id', '=', 'auth_user_roles.role_id')
                    ->where('auth_user_roles.is_active', 1);
            })
            ->leftJoin('auth_users', function ($join) {
                $join->on('auth_users.id', '=', 'auth_user_roles.user_id')
                    ->whereNull('auth_users.deleted_at');
            })
            ->where('auth_roles.is_active', 1)
            ->groupBy(
                'auth_roles.id',
                'auth_roles.name',
                'auth_roles.slug',
                'auth_roles.description',
                'auth_roles.is_system',
                'auth_roles.is_active',
            )
            ->orderBy('auth_roles.name')
            ->select([
                'auth_roles.id',
                'auth_roles.name',
                'auth_roles.slug',
                'auth_roles.description',
                'auth_roles.is_system',
                'auth_roles.is_active',
            ])
            ->selectRaw('COUNT(DISTINCT auth_users.id) as total')
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN auth_users.status = 'Active' AND auth_users.is_active = 1 THEN 1 ELSE 0 END), 0) as active"
            )
            ->selectRaw(
                "COALESCE(SUM(CASE WHEN auth_users.status = 'PendingVerification' THEN 1 ELSE 0 END), 0) as pending"
            );

        $user = $request->user();
        if ($user && $this->isMonitoringRoleSlug($this->activeRoleSlugForUser((int) $user->id))) {
            $query->where(function ($q) {
                $q->where('auth_roles.slug', 'like', '%monitoring%')
                    ->orWhere('auth_roles.name', 'like', '%monitoring%');
            });
        }

        $rows = $query->get()
            ->map(function ($row) {
                $row->is_system = (bool) $row->is_system;
                $row->is_active = (bool) $row->is_active;
                $row->total = (int) $row->total;
                $row->active = (int) $row->active;
                $row->pending = (int) $row->pending;

                return $row;
            });

        return response()->json(['data' => $rows]);
    }

    /**
     * Latest users from auth_users with optional role label from auth_user_roles + auth_roles.
     *
     * @see database/migrations/2026_04_02_000001_create_auth_users_table.php
     */
    public function recentUsers(Request $request): JsonResponse
    {
        $query = DB::table('auth_users')
            ->whereNull('deleted_at');

        $user = $request->user();
        if ($user && $this->isMonitoringRoleSlug($this->activeRoleSlugForUser((int) $user->id))) {
            $query->whereExists(function ($q) {
                $q->select(DB::raw(1))
                    ->from('auth_user_roles as aur')
                    ->join('auth_roles as ar', 'ar.id', '=', 'aur.role_id')
                    ->whereColumn('aur.user_id', 'auth_users.id')
                    ->where('aur.is_active', 1)
                    ->where('ar.is_active', 1)
                    ->where(function ($roleQuery) {
                        $roleQuery->where('ar.slug', 'like', '%monitoring%')
                            ->orWhere('ar.name', 'like', '%monitoring%');
                    });
            });
        }

        $rows = $query
            ->orderByDesc('auth_users.created_at')
            ->limit(10)
            ->select([
                'auth_users.id',
                'auth_users.email',
                'auth_users.display_name',
                'auth_users.first_name',
                'auth_users.last_name',
                'auth_users.status',
            ])
            ->selectRaw(
                '(SELECT ar.name FROM auth_user_roles aur INNER JOIN auth_roles ar ON ar.id = aur.role_id '
                .'WHERE aur.user_id = auth_users.id AND aur.is_active = 1 AND ar.is_active = 1 '
                .'ORDER BY aur.assigned_at DESC LIMIT 1) as role_name'
            )
            ->get()
            ->map(function ($row) {
                $name = $row->display_name ?: trim(implode(' ', array_filter([$row->first_name, $row->last_name])));
                if ($name === '') {
                    $name = $row->email;
                }

                return [
                    'id' => (int) $row->id,
                    'name' => $name,
                    'email' => $row->email,
                    'role' => $row->role_name !== null ? (string) $row->role_name : null,
                    'status' => (string) $row->status,
                ];
            });

        return response()->json(['data' => $rows]);
    }

    /**
     * Create auth_users row and optional auth_user_roles assignment.
     *
     * @see database/migrations/2026_04_02_000001_create_auth_users_table.php
     * @see database/migrations/2026_04_02_000004_create_auth_user_roles_table.php
     */
    public function storeUser(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $this->activeRoleSlugForUser((int) $user->id) !== 'superadmin') {
            return response()->json([
                'message' => 'Forbidden. Only superadmin can create users.',
            ], 403);
        }

        $statuses = ['Active', 'Inactive', 'Suspended', 'Banned', 'PendingVerification'];

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:auth_users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'display_name' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in($statuses)],
            'role_id' => ['nullable', 'integer', Rule::exists('auth_roles', 'id')->where('is_active', 1)],
        ]);

        $user = DB::transaction(function () use ($request, $validated) {
            $activatable = in_array($validated['status'], ['Active', 'PendingVerification'], true);

            $user = User::create([
                'email' => $validated['email'],
                'password' => $validated['password'],
                'first_name' => $validated['first_name'] ?? null,
                'last_name' => $validated['last_name'] ?? null,
                'display_name' => $validated['display_name'] ?? null,
                'email_verified' => false,
                'is_active' => $activatable ? 1 : 0,
            ]);

            $user->status = $validated['status'];
            $user->is_suspended = $validated['status'] === 'Suspended' ? 1 : 0;
            $user->save();

            if (! empty($validated['role_id'])) {
                DB::table('auth_user_roles')->insert([
                    'user_id' => $user->id,
                    'role_id' => (int) $validated['role_id'],
                    'assigned_by' => (int) $request->user()->id,
                    'assigned_at' => now(),
                    'expires_at' => null,
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return $user;
        });

        $name = $user->display_name ?: trim(implode(' ', array_filter([$user->first_name, $user->last_name])));
        if ($name === '') {
            $name = $user->email;
        }

        return response()->json([
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $name,
                'status' => $user->status,
            ],
        ], 201);
    }

    /**
     * Create a new role in auth_roles.
     */
    public function storeRole(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $this->activeRoleSlugForUser((int) $user->id) !== 'superadmin') {
            return response()->json([
                'message' => 'Forbidden. Only superadmin can create roles.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', 'unique:auth_roles,slug'],
            'description' => ['nullable', 'string'],
            'is_system' => ['boolean']
        ]);

        $roleId = DB::table('auth_roles')->insertGetId([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'is_system' => $validated['is_system'] ?? 0,
            'is_active' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'id' => $roleId,
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
            ],
        ], 201);
    }
}
