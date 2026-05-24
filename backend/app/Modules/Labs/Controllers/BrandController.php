<?php

namespace App\Modules\Labs\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Labs\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'logo'        => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $brand = Brand::create($validated);
        return response()->json($brand, 201);
    }

    public function show($id)
    {
        return response()->json(Brand::with('products')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'logo'        => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $brand->update($validated);
        return response()->json($brand);
    }

    public function destroy($id)
    {
        Brand::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
