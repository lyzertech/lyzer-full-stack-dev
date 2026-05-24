<?php

namespace App\Modules\Labs\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Labs\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with('specDefinitions');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        return response()->json($query->orderBy('sort_order')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:100',
            'parent_id'   => 'nullable|exists:labs_categories,id',
            'sort_order'  => 'integer',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $category = Category::create($validated);

        return response()->json($category->load('specDefinitions'), 201);
    }

    public function show($id)
    {
        return response()->json(
            Category::with(['specDefinitions', 'products.brand'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:100',
            'parent_id'   => 'nullable|exists:labs_categories,id',
            'sort_order'  => 'integer',
            'is_active'   => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        return response()->json($category->load('specDefinitions'));
    }

    public function destroy($id)
    {
        Category::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    // ─── Spec Mapping ─────────────────────────────────────────────────────────

    /**
     * GET /labs/categories/{id}/specs
     * Returns all specs mapped to a category with pivot data.
     */
    public function specs($id)
    {
        $category = Category::with('specDefinitions')->findOrFail($id);
        return response()->json($category->specDefinitions);
    }

    /**
     * POST /labs/categories/{id}/specs
     * Sync spec definitions to a category.
     * Body: { specs: [{ spec_definition_id, is_required, sort_order }] }
     */
    public function syncSpecs(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'specs'                       => 'required|array',
            'specs.*.spec_definition_id'  => 'required|exists:labs_spec_definitions,id',
            'specs.*.is_required'         => 'boolean',
            'specs.*.sort_order'          => 'integer',
        ]);

        $syncData = [];
        foreach ($validated['specs'] as $spec) {
            $syncData[$spec['spec_definition_id']] = [
                'is_required' => $spec['is_required'] ?? false,
                'sort_order'  => $spec['sort_order'] ?? 0,
            ];
        }

        $category->specDefinitions()->sync($syncData);

        return response()->json($category->load('specDefinitions'));
    }
}
