<?php

use Illuminate\Support\Facades\Route;

// ─── Finance (authenticated) ──────────────────────────────────────────────
// Exposes all finance endpoints at /api/v1/finance/* without subdomain,
// required for localhost dev (subdomain routing needs DNS / hosts file setup).
Route::middleware(['api', 'auth.session'])
    ->prefix('v1/finance')
    ->group(app_path('Modules/Finance/routes.php'));

// ─── Monitoring (authenticated) ───────────────────────────────────────────
Route::middleware(['api', 'auth.session'])
    ->prefix('v1/monitoring')
    ->group(app_path('Modules/Monitoring/routes.php'));

// ─── Labs (authenticated) ─────────────────────────────────────────────────
Route::middleware(['api', 'auth.session'])
    ->prefix('v1/labs')
    ->group(app_path('Modules/Labs/routes.php'));

// ─── Point+ (authenticated) ───────────────────────────────────────────────
Route::middleware(['api', 'auth.session'])
    ->prefix('v1/point-plus')
    ->group(app_path('Modules/PointPlus/routes.php'));

// ─── Vehicle (authenticated) ──────────────────────────────────────────────
Route::middleware(['api', 'auth.session'])
    ->prefix('v1/vehicle')
    ->group(app_path('Modules/Vehicle/routes.php'));
