<?php

use App\Modules\School\Controllers\SchoolDashboardController;
use App\Modules\School\Controllers\StudentController;
use App\Modules\School\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [SchoolDashboardController::class, 'index']);

Route::apiResource('students', StudentController::class);
Route::apiResource('teachers', TeacherController::class);
