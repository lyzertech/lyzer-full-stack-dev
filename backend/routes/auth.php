<?php

use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Sales\Controllers\SalesDataController;
use App\Modules\Auth\Controllers\UserDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes — /api/v1/*
|--------------------------------------------------------------------------
| Registered by ModuleServiceProvider with prefix: api/v1
|
|  POST   /api/v1/login
|  POST   /api/v1/logout   (requires sanctum)
|  GET    /api/v1/me       (requires sanctum)
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth.session')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/users/dashboard/users-by-role', [UserDashboardController::class, 'usersByRole']);
    Route::get('/users/dashboard/recent-users', [UserDashboardController::class, 'recentUsers']);
    Route::post('/users/dashboard/users', [UserDashboardController::class, 'storeUser']);
    Route::post('/users/dashboard/roles', [UserDashboardController::class, 'storeRole']);
    Route::get('/sales/customers', [SalesDataController::class, 'customers']);
    Route::post('/sales/customers', [SalesDataController::class, 'storeCustomer']);
    Route::get('/sales/visit-reports', [SalesDataController::class, 'visitReports']);
    Route::post('/sales/visit-reports', [SalesDataController::class, 'storeVisitReport']);
    Route::put('/sales/visit-reports/{idTarget}', [SalesDataController::class, 'updateVisitReport']);
    Route::get('/sales/products', [SalesDataController::class, 'products']);
    Route::post('/sales/products', [SalesDataController::class, 'storeProduct']);
});
