<?php

namespace App\Modules\PointPlus\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PointPlus\Models\StockMovement;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $movements = StockMovement::with('product')->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
        return response()->json($movements);
    }
}
