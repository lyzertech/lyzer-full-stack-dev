<?php

namespace App\Modules\PointPlus\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PointPlus\Models\Transaction;
use App\Modules\PointPlus\Models\TransactionItem;
use App\Modules\PointPlus\Models\Product;
use App\Modules\PointPlus\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = Transaction::with('items.product')->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));
        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'amount_paid' => 'required|numeric',
            'discount' => 'numeric',
            'tax' => 'numeric',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:pointplus_products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'items.*.discount' => 'numeric',
        ]);

        try {
            DB::beginTransaction();

            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += ($item['price'] - ($item['discount'] ?? 0)) * $item['quantity'];
            }

            $discount = $validated['discount'] ?? 0;
            $tax = $validated['tax'] ?? 0;
            $total = $subtotal - $discount + $tax;
            $change = $validated['amount_paid'] - $total;

            if ($change < 0 && !in_array($validated['payment_method'], ['Transfer', 'Debit/Credit'])) {
                 return response()->json(['error' => 'Insufficient payment amount.'], 400);
            }

            // Create Transaction
            $transaction = Transaction::create([
                'transaction_number' => 'TRX-' . strtoupper(Str::random(8)) . time(),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'amount_paid' => $validated['amount_paid'],
                'change' => max(0, $change),
                'status' => 'completed',
                'cashier_id' => auth()->id() ?? 1, // Fallback to 1 if no auth user in context
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                     throw new \Exception("Insufficient stock for {$product->product_name}");
                }

                $itemSubtotal = ($item['price'] - ($item['discount'] ?? 0)) * $item['quantity'];

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $itemSubtotal,
                ]);

                // Deduct stock
                $product->decrement('stock', $item['quantity']);

                // Create stock movement
                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'out',
                    'quantity' => $item['quantity'],
                    'reference_type' => 'Sale',
                    'reference_id' => $transaction->id,
                    'notes' => 'Sale Transaction',
                ]);
            }

            DB::commit();

            return response()->json($transaction->load('items.product'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function show($id)
    {
        $transaction = Transaction::with('items.product')->findOrFail($id);
        return response()->json($transaction);
    }
}
