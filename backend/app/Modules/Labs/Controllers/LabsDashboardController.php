<?php

namespace App\Modules\Labs\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class LabsDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'module'  => 'labs',
            'message' => 'Welcome to Labs Dashboard',
            'data'    => [
                'total_tests'      => 342,
                'passed'           => 301,
                'failed'           => 18,
                'pending_review'   => 23,
            ],
        ]);
    }
}
