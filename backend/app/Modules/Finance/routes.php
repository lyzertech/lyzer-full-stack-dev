<?php

use App\Modules\Finance\Controllers\FinanceDashboardController;
use App\Modules\Finance\Controllers\FinanceReferenceController;
use App\Modules\Finance\Controllers\BankController;
use App\Modules\Finance\Controllers\AccountController;
use App\Modules\Finance\Controllers\CategoryController;
use App\Modules\Finance\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [FinanceDashboardController::class, 'index']);
Route::get('/reference', [FinanceReferenceController::class, 'index']);

Route::apiResource('banks', BankController::class);
Route::apiResource('accounts', AccountController::class);
Route::get('/categories/tree', [CategoryController::class, 'tree']);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('transactions', TransactionController::class)->except(['update']);
