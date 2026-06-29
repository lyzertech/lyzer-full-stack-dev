<?php

use Illuminate\Support\Facades\Route;
use App\Modules\{{ModuleName}}\Controllers\{{ModelName}}Controller;

/**
 * {{ModuleName}} Module Routes
 * Following Lyzer modular architecture rules
 * Location: app/Modules/{{ModuleName}}/routes.php
 * 
 * These routes are automatically registered by ModuleServiceProvider
 * under subdomain: {{moduleName}}.lyzer.test
 * with prefix: /api/{{moduleName}}
 * and middleware: ['api', 'auth:sanctum', 'role:{{moduleName}}']
 */

// {{ModelName}} Resource Routes
Route::apiResource('{{resourceName}}', {{ModelName}}Controller::class);

// Additional custom routes
Route::prefix('{{resourceName}}')->group(function () {
    // Custom routes for specific actions
    // Route::get('search', [{{ModelName}}Controller::class, 'search']);
    // Route::post('bulk-create', [{{ModelName}}Controller::class, 'bulkCreate']);
    // Route::patch('bulk-update', [{{ModelName}}Controller::class, 'bulkUpdate']);
    // Route::delete('bulk-delete', [{{ModelName}}Controller::class, 'bulkDelete']);
});

// Dashboard/Analytics routes
Route::get('dashboard', function () {
    // Dashboard data for {{ModuleName}} module
    return response()->json([
        'success' => true,
        'data' => [
            'stats' => [
                // Add your dashboard stats here
            ],
            'recent_activities' => [
                // Add recent activities here
            ]
        ]
    ]);
});

// Reports routes
Route::prefix('reports')->group(function () {
    // Route::get('summary', [{{ModelName}}Controller::class, 'summaryReport']);
    // Route::get('detailed', [{{ModelName}}Controller::class, 'detailedReport']);
    // Route::post('export', [{{ModelName}}Controller::class, 'export']);
});

/**
 * Route Examples:
 * 
 * Accessible via: {{moduleName}}.lyzer.test/api/{{moduleName}}/
 * 
 * GET    /api/{{moduleName}}/{{resourceName}}           - List all
 * POST   /api/{{moduleName}}/{{resourceName}}           - Create new
 * GET    /api/{{moduleName}}/{{resourceName}}/{id}      - Show specific
 * PUT    /api/{{moduleName}}/{{resourceName}}/{id}      - Update specific
 * DELETE /api/{{moduleName}}/{{resourceName}}/{id}      - Delete specific
 * 
 * GET    /api/{{moduleName}}/dashboard                  - Dashboard data
 * GET    /api/{{moduleName}}/reports/summary            - Summary report
 */