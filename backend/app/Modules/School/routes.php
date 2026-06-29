<?php

use App\Modules\School\Controllers\GradeController;
use App\Modules\School\Controllers\SchoolDashboardController;
use App\Modules\School\Controllers\StudentController;
use App\Modules\School\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [SchoolDashboardController::class, 'index']);

Route::get('grades', [GradeController::class, 'index']);
Route::post('grades', [GradeController::class, 'store']);
Route::patch('grades', [GradeController::class, 'patch']);
Route::delete('grades', [GradeController::class, 'destroy']);

Route::apiResource('students', StudentController::class);
Route::apiResource('teachers', TeacherController::class);
