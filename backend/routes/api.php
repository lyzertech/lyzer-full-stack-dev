<?php

// This file intentionally left minimal.
// Module routes are auto-registered by ModuleServiceProvider
// using subdomain groups per module (Finance, Labs, School).
//
// Auth routes are loaded from routes/auth.php by ModuleServiceProvider.

use Illuminate\Support\Facades\Route;
use App\Modules\School\Controllers\TeacherController;

Route::get('/ping', fn() => response()->json(['status' => 'ok', 'service' => 'lyzer-api']));

// Expose teachers publicly on main domain for easy frontend integration
Route::apiResource('teachers', TeacherController::class);
Route::apiResource('students', \App\Modules\School\Controllers\StudentController::class);
