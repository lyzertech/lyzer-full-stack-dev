<?php

use App\Modules\Vehicle\Controllers\VehicleDashboardController;
use App\Modules\Vehicle\Controllers\VehicleTypeController;
use App\Modules\Vehicle\Controllers\VehicleController;
use App\Modules\Vehicle\Controllers\DriverController;
use App\Modules\Vehicle\Controllers\VendorController;
use App\Modules\Vehicle\Controllers\SparepartController;
use App\Modules\Vehicle\Controllers\WorkOrderController;
use App\Modules\Vehicle\Controllers\ServiceReminderController;
use App\Modules\Vehicle\Controllers\InspectionChecklistController;
use App\Modules\Vehicle\Controllers\FuelLogController;
use Illuminate\Support\Facades\Route;

// ─── Dashboard ────────────────────────────────────────────────────────────────
Route::get('/dashboard', [VehicleDashboardController::class, 'index']);

// ─── Vehicle Types ────────────────────────────────────────────────────────────
Route::apiResource('vehicle-types', VehicleTypeController::class);

// ─── Vehicles ─────────────────────────────────────────────────────────────────
Route::post('/vehicles/{vehicle}/odometer', [VehicleController::class, 'updateOdometer']);
Route::apiResource('vehicles', VehicleController::class);

// ─── Drivers ─────────────────────────────────────────────────────────────────
Route::apiResource('drivers', DriverController::class);

// ─── Vendors/Workshops ────────────────────────────────────────────────────────
Route::apiResource('vendors', VendorController::class);

// ─── Spareparts ───────────────────────────────────────────────────────────────
Route::get('/spareparts/low-stock', [SparepartController::class, 'lowStock']);
Route::get('/spareparts/categories', [SparepartController::class, 'categories']);
Route::post('/spareparts/{sparepart}/add-stock', [SparepartController::class, 'addStock']);
Route::get('/spareparts/{sparepart}/stock-logs', [SparepartController::class, 'stockLogs']);
Route::apiResource('spareparts', SparepartController::class);

// ─── Work Orders ──────────────────────────────────────────────────────────────
Route::post('/work-orders/{workOrder}/approve', [WorkOrderController::class, 'approve']);
Route::apiResource('work-orders', WorkOrderController::class);

// ─── Service Reminders ────────────────────────────────────────────────────────
Route::post('/reminders/refresh', [ServiceReminderController::class, 'refresh']);
Route::post('/reminders/{serviceReminder}/dismiss', [ServiceReminderController::class, 'dismiss']);
Route::post('/reminders/{serviceReminder}/complete', [ServiceReminderController::class, 'complete']);
Route::apiResource('reminders', ServiceReminderController::class)->only(['index']);

// ─── Inspection Checklists ────────────────────────────────────────────────────
Route::apiResource('inspections', InspectionChecklistController::class)->except(['update']);

// ─── Fuel Logs ────────────────────────────────────────────────────────────────
Route::get('/fuel-logs/analytics', [FuelLogController::class, 'analytics']);
Route::apiResource('fuel-logs', FuelLogController::class)->except(['show']);
