<?php

namespace App\Modules\School\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class SchoolDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'module'  => 'school',
            'message' => 'Welcome to School Dashboard',
            'data'    => [
                'total_students'   => 1240,
                'active_classes'   => 48,
                'teachers'         => 67,
                'attendance_rate'  => '94.2%',
            ],
        ]);
    }
}
