<?php

namespace App\Modules\PointPlus\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PointPlus\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('product_name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
        }

        if ($request->has('barcode')) {
            $query->where('barcode', $request->barcode);
        }

        $products = $query->paginate($request->get('per_page', 15));

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barcode' => 'required|string|unique:pointplus_products',
            'product_name' => 'required|string',
            'selling_price' => 'required|numeric',
            'purchase_price' => 'numeric',
            'stock' => 'integer',
        ]);

        $product = Product::create($request->all());

        return response()->json($product, 201);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'barcode' => 'string|unique:pointplus_products,barcode,' . $id,
            'product_name' => 'string',
            'selling_price' => 'numeric',
        ]);

        $product->update($request->all());

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(null, 204);
    }
}
