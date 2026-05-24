<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CustomAuthSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated. Token missing.'], 401);
        }

        $hashedToken = hash('sha256', $token);

        $session = DB::table('auth_user_sessions')
            ->where('session_token', $hashedToken)
            ->where('is_active', 1)
            ->where('expires_at', '>', now())
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Unauthenticated or session expired.'], 401);
        }

        // Note: avoid per-request session row updates here; some production hosts
        // were invalidating sessions after the first authenticated API call.

        $user = User::find($session->user_id);

        if (!$user || !$user->is_active || $user->is_suspended || in_array($user->status, ['Banned', 'Suspended'])) {
            return response()->json(['message' => 'Unauthenticated. User account is inactive or disabled.'], 401);
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
