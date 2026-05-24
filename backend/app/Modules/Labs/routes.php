<?php

use App\Modules\Labs\Controllers\LabsDashboardController;
use App\Modules\Labs\Controllers\QcReportController;
use App\Modules\Labs\Controllers\BrandController;
use App\Modules\Labs\Controllers\CategoryController;
use App\Modules\Labs\Controllers\SpecDefinitionController;
use App\Modules\Labs\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [LabsDashboardController::class, 'index']);

Route::apiResource('qc-reports', QcReportController::class);

// ─── Product Spec System ───────────────────────────────────────────────────────

Route::apiResource('brands', BrandController::class);

Route::apiResource('categories', CategoryController::class);
Route::get('categories/{id}/specs',   [CategoryController::class, 'specs']);
Route::post('categories/{id}/specs',  [CategoryController::class, 'syncSpecs']);

Route::get('spec-definitions/groups', [SpecDefinitionController::class, 'groups']);
Route::apiResource('spec-definitions', SpecDefinitionController::class);

Route::apiResource('products', ProductController::class);
