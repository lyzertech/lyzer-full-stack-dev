<?php

use App\Modules\Finance\Controllers\FinanceDashboardController;
use App\Modules\Finance\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [FinanceDashboardController::class, 'index']);

Route::apiResource('transactions', TransactionController::class);
