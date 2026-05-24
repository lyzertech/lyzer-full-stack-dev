<?php

namespace App\Modules\PointPlus\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PointPlus\Models\Purchase;
use App\Modules\PointPlus\Models\PurchaseItem;
use App\Modules\PointPlus\Models\Product;
use App\Modules\PointPlus\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $purchases = Purchase::with(['supplier', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($purchases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:pointplus_suppliers,id',
            'invoice_number' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:pointplus_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $total = 0;
            foreach ($validated['items'] as $item) {
                $total += $item['price'] * $item['quantity'];
            }

            $purchase = Purchase::create([
                'supplier_id' => $validated['supplier_id'],
                'invoice_number' => $validated['invoice_number'] ?? null,
                'purchase_date' => $validated['purchase_date'],
                'total' => $total,
                'status' => 'completed',
            ]);

            foreach ($validated['items'] as $item) {
                $subtotal = $item['price'] * $item['quantity'];

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                ]);

                // Update product stock and purchase price (moving average or last price - we'll use last price here)
                $product = Product::findOrFail($item['product_id']);
                $product->increment('stock', $item['quantity']);
                $product->update(['purchase_price' => $item['price']]);

                // Create stock movement
                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'in',
                    'quantity' => $item['quantity'],
                    'reference_type' => 'Purchase',
                    'reference_id' => $purchase->id,
                    'notes' => 'Supplier Purchase',
                ]);
            }

            DB::commit();

            return response()->json($purchase->load(['supplier', 'items.product']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function show($id)
    {
        $purchase = Purchase::with(['supplier', 'items.product'])->findOrFail($id);
        return response()->json($purchase);
    }
}
