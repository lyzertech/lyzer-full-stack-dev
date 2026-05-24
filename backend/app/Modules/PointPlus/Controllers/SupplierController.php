<?php

namespace App\Modules\PointPlus\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PointPlus\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('supplier_name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
        }

        $suppliers = $query->paginate($request->get('per_page', 15));
        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $supplier = Supplier::create($validated);
        return response()->json($supplier, 201);
    }

    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);
        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        
        $validated = $request->validate([
            'supplier_name' => 'sometimes|required|string|max:255',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $supplier->update($validated);
        return response()->json($supplier);
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();
        return response()->json(null, 204);
    }
}
