<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Monitoring\Controllers\OrganizationController;
use App\Modules\Monitoring\Controllers\FacilityController;
use App\Modules\Monitoring\Controllers\DeviceController;
use App\Modules\Monitoring\Controllers\AcuvimController;

Route::apiResource('organizations', OrganizationController::class);
Route::apiResource('facilities', FacilityController::class);
Route::apiResource('devices', DeviceController::class);

// Device Tree hierarchy
Route::get('device-tree', [OrganizationController::class, 'deviceTree']);

// Scan Network — discover unique devices from monitoring_acuvim telemetry data
Route::get('acuvim/scan', [AcuvimController::class, 'scan']);

// Data Retrieval — list distinct device names, or fetch paginated records by device
Route::get('acuvim/devices', [AcuvimController::class, 'deviceNames']);
Route::get('acuvim/data',    [AcuvimController::class, 'data']);
Route::get('acuvim/daily-energy', [AcuvimController::class, 'dailyEnergy']);
