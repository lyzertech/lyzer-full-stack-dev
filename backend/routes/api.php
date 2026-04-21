<?php

// Module routes are auto-registered by ModuleServiceProvider
// using subdomain groups per module (Finance, Labs, School).
//
// Finance routes are ALSO registered here (without subdomain) so they
// resolve at localhost:8000/api/v1/finance/* during local development.
// In production the subdomain variant (finance.lyzer.test) takes precedence.
//
// Auth routes are loaded from routes/auth.php by ModuleServiceProvider.

use Illuminate\Support\Facades\Route;
use App\Modules\School\Controllers\TeacherController;

Route::get('/ping', fn() => response()->json(['status' => 'ok', 'service' => 'lyzer-api']));

// ─── School (public, no auth) ─────────────────────────────────────────────
// Expose teachers publicly on main domain for easy frontend integration
Route::apiResource('teachers', TeacherController::class);
Route::apiResource('students', \App\Modules\School\Controllers\StudentController::class);

// ─── Finance (authenticated) ──────────────────────────────────────────────
// Exposes all finance endpoints at /api/v1/finance/* without subdomain,
// required for localhost dev (subdomain routing needs DNS / hosts file setup).
Route::middleware(['api', 'auth.session'])
    ->prefix('v1/finance')
    ->group(app_path('Modules/Finance/routes.php'));
