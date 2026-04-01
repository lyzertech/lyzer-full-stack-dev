<?php

use App\Http\Controllers\AuthController;
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
});
