<?php

// This file intentionally left minimal.
// Module routes are auto-registered by ModuleServiceProvider
// using subdomain groups per module (Finance, Labs, School).
//
// Auth routes are loaded from routes/auth.php by ModuleServiceProvider.

use Illuminate\Support\Facades\Route;

Route::get('/ping', fn() => response()->json(['status' => 'ok', 'service' => 'lyzer-api']));
