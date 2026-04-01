<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // --- SECURITY FIX: Prevent Suspended/Banned/Inactive users from logging in ---
        if (!$user->is_active || $user->is_suspended || in_array($user->status, ['Banned', 'Suspended'])) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated or suspended. Please contact support.'],
            ]);
        }

        // --- MONITORING FIX: Update Last Login Information ---
        $user->last_login_at = now();
        $user->last_login_ip = $request->ip();
        $user->save();

        $token = \Illuminate\Support\Str::random(60);
        $refreshToken = \Illuminate\Support\Str::random(60);

        \Illuminate\Support\Facades\DB::table('auth_user_sessions')->insert([
            'user_id' => $user->id,
            'session_token' => hash('sha256', $token),
            'refresh_token' => hash('sha256', $refreshToken),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'expires_at' => now()->addDays(7),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $roleRecord = \Illuminate\Support\Facades\DB::table('auth_user_roles')
            ->join('auth_roles', 'auth_user_roles.role_id', '=', 'auth_roles.id')
            ->where('auth_user_roles.user_id', $user->id)
            ->where('auth_user_roles.is_active', 1)
            ->select('auth_roles.slug')
            ->first();

        $roleSlug = $roleRecord ? $roleRecord->slug : 'user';

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->display_name ?? trim($user->first_name . ' ' . $user->last_name),
                'email' => $user->email,
                'role' => $roleSlug,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token) {
            \Illuminate\Support\Facades\DB::table('auth_user_sessions')
                ->where('session_token', hash('sha256', $token))
                ->update(['is_active' => 0]);
        }

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        // Custom token retrieval logic if needed, but returning user
        return response()->json($request->user());
    }
}
