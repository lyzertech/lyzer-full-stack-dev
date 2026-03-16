<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class FinanceDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'module'  => 'finance',
            'message' => 'Welcome to Finance Dashboard',
            'data'    => [
                'total_revenue'   => 150000000,
                'total_expenses'  => 87500000,
                'net_profit'      => 62500000,
                'pending_invoices' => 12,
            ],
        ]);
    }
}
