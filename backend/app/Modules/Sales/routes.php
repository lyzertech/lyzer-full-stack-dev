<?php

use App\Modules\Sales\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::apiResource('customers', CustomerController::class);
