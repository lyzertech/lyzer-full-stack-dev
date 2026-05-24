<?php

namespace App\Modules\PointPlus\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PointPlus\Models\Product;
use App\Modules\PointPlus\Models\Transaction;
use App\Modules\PointPlus\Models\StockMovement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getAnalytics(Request $request)
    {
        $today = Carbon::today();
        
        $todaySales = Transaction::whereDate('created_at', $today)->sum('total');
        $todayTransactions = Transaction::whereDate('created_at', $today)->count();
        
        $totalProducts = Product::count();
        $lowStockAlerts = Product::whereColumn('stock', '<=', 'minimum_stock')->count();

        // Recent Transactions
        $recentTransactions = Transaction::orderBy('created_at', 'desc')->take(5)->get();

        // Low stock products list
        $lowStockProducts = Product::whereColumn('stock', '<=', 'minimum_stock')
                                    ->orderBy('stock', 'asc')
                                    ->take(5)
                                    ->get();

        // Chart Data (Last 7 days sales)
        $salesChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $total = Transaction::whereDate('created_at', $date)->sum('total');
            $salesChart[] = [
                'date' => $date->format('Y-m-d'),
                'total' => $total
            ];
        }

        return response()->json([
            'cards' => [
                'today_sales' => $todaySales,
                'today_transactions' => $todayTransactions,
                'total_products' => $totalProducts,
                'low_stock_alerts' => $lowStockAlerts,
            ],
            'recent_transactions' => $recentTransactions,
            'low_stock_products' => $lowStockProducts,
            'sales_chart' => $salesChart
        ]);
    }
}
