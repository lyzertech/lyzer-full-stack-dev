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
        'sales'   => 'sales',
    ];

    public function boot(): void
    {
        foreach ($this->modules as $module => $role) {
            $routesFile = app_path("Modules/" . ucfirst($module) . "/routes.php");

            if (file_exists($routesFile)) {
                Route::domain($module . '.' . config('app.base_domain', 'lyzer.test'))
                    ->middleware(['api', 'auth.session', 'role:' . $role])
                    ->prefix('api/v1/' . $module)
                    ->namespace("App\\Modules\\" . ucfirst($module) . "\\Controllers")
                    ->group($routesFile);
            }
        }

        // Public auth routes — versioned under /api/v1/
        Route::middleware('api')
            ->prefix('api/v1')
            ->group(base_path('routes/auth.php'));
    }
}
