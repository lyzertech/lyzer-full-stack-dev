<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Supported modules and their allowed roles.
     */
    protected array $modules = [
        'finance' => 'finance',
        'labs'    => 'labs',
        'school'  => 'school',
    ];

    public function boot(): void
    {
        foreach ($this->modules as $module => $role) {
            $routesFile = app_path("Modules/" . ucfirst($module) . "/routes.php");

            if (file_exists($routesFile)) {
                Route::domain($module . '.' . config('app.base_domain', 'lyzer.test'))
                    ->middleware(['api', 'auth:sanctum', 'role:' . $role])
                    ->prefix('api/' . $module)
                    ->namespace("App\\Modules\\" . ucfirst($module) . "\\Controllers")
                    ->group($routesFile);
            }
        }

        // Public auth routes (no subdomain restriction)
        Route::middleware('api')
            ->prefix('api/auth')
            ->group(base_path('routes/auth.php'));
    }
}
