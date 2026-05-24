<?php

use Illuminate\Support\Facades\Route;
use App\Modules\PointPlus\Controllers\ProductController;
use App\Modules\PointPlus\Controllers\TransactionController;
use App\Modules\PointPlus\Controllers\StockMovementController;
use App\Modules\PointPlus\Controllers\SupplierController;
use App\Modules\PointPlus\Controllers\PurchaseController;
use App\Modules\PointPlus\Controllers\DashboardController;

Route::get('dashboard/analytics', [DashboardController::class, 'getAnalytics']);

Route::apiResource('products', ProductController::class);
Route::apiResource('transactions', TransactionController::class);
Route::apiResource('stock-movements', StockMovementController::class)->only(['index']);
Route::apiResource('suppliers', SupplierController::class);
Route::apiResource('purchases', PurchaseController::class)->except(['update', 'destroy']);
