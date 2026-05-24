<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures Authorization reaches the app on Apache/cPanel (often strips Bearer).
 * Must run before auth.session.
 */
class ResolveBearerToken
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken()) {
            return $next($request);
        }

        $raw = $request->header('Authorization')
            ?? $request->header('X-Authorization')
            ?? $request->server->get('HTTP_AUTHORIZATION')
            ?? $request->server->get('REDIRECT_HTTP_AUTHORIZATION');

        if (is_string($raw) && preg_match('/^\s*Bearer\s+(\S+)\s*$/i', $raw, $matches)) {
            $request->headers->set('Authorization', 'Bearer '.$matches[1]);
        }

        return $next($request);
    }
}
