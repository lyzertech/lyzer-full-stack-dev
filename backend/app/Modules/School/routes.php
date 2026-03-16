<?php

use App\Modules\School\Controllers\SchoolDashboardController;
use App\Modules\School\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [SchoolDashboardController::class, 'index']);

Route::apiResource('students', StudentController::class);
