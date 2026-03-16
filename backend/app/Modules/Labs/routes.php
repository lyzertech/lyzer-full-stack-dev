<?php

use App\Modules\Labs\Controllers\LabsDashboardController;
use App\Modules\Labs\Controllers\QcReportController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [LabsDashboardController::class, 'index']);

Route::apiResource('qc-reports', QcReportController::class);
