<?php

namespace App\Modules\Labs\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Labs\Models\Product;
use App\Modules\Labs\Models\ProductSpecValue;
use App\Modules\Labs\Models\SpecDefinition;
use App\Modules\Labs\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['brand', 'category']);

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('product_name', 'like', '%' . $request->search . '%')
                  ->orWhere('model', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 20);
        return response()->json($query->orderBy('product_name')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand_id'     => 'nullable|exists:labs_brands,id',
            'category_id'  => 'nullable|exists:labs_categories,id',
            'product_name' => 'required|string|max:255',
            'model'        => 'nullable|string|max:100',
            'sku'          => 'nullable|string|max:100|unique:labs_products,sku',
            'description'  => 'nullable|string',
            'image'        => 'nullable|string|max:500',
            'datasheet'    => 'nullable|string|max:500',
            'status'       => 'in:Active,Discontinued,Draft',
            'specs'        => 'nullable|array',
        ]);

        $specs = $validated['specs'] ?? [];
        unset($validated['specs']);

        DB::beginTransaction();
        try {
            $product = Product::create($validated);
            $this->upsertSpecValues($product, $specs);
            $product->rebuildSpecsCache();
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return response()->json($product->load(['brand', 'category', 'specValues.specDefinition']), 201);
    }

    public function show($id)
    {
        $product = Product::with([
            'brand',
            'category.specDefinitions',
            'specValues.specDefinition',
        ])->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'brand_id'     => 'nullable|exists:labs_brands,id',
            'category_id'  => 'nullable|exists:labs_categories,id',
            'product_name' => 'sometimes|string|max:255',
            'model'        => 'nullable|string|max:100',
            'sku'          => 'nullable|string|max:100|unique:labs_products,sku,' . $id,
            'description'  => 'nullable|string',
            'image'        => 'nullable|string|max:500',
            'datasheet'    => 'nullable|string|max:500',
            'status'       => 'in:Active,Discontinued,Draft',
            'specs'        => 'nullable|array',
        ]);

        $specs = $validated['specs'] ?? null;
        unset($validated['specs']);

        DB::beginTransaction();
        try {
            $product->update($validated);
            if ($specs !== null) {
                $this->upsertSpecValues($product, $specs);
                $product->rebuildSpecsCache();
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return response()->json($product->load(['brand', 'category', 'specValues.specDefinition']));
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Upsert spec values for a product.
     *
     * $specs format:
     * [
     *   { "spec_definition_id": 1, "value": "220" },
     *   { "spec_definition_id": 2, "value": true },
     * ]
     */
    private function upsertSpecValues(Product $product, array $specs): void
    {
        $defIds = collect($specs)->pluck('spec_definition_id')->filter()->unique()->toArray();
        $definitions = SpecDefinition::whereIn('id', $defIds)->get()->keyBy('id');

        foreach ($specs as $spec) {
            $defId = $spec['spec_definition_id'] ?? null;
            $value = $spec['value'] ?? null;

            if (!$defId || !isset($definitions[$defId])) {
                continue;
            }

            $def  = $definitions[$defId];
            $row  = [
                'product_id'          => $product->id,
                'spec_definition_id'  => $defId,
                'value_text'          => null,
                'value_number'        => null,
                'value_decimal'       => null,
                'value_boolean'       => null,
                'value_json'          => null,
            ];

            match ($def->data_type) {
                'number'       => $row['value_number']  = (int) $value,
                'decimal'      => $row['value_decimal']  = (float) $value,
                'boolean'      => $row['value_boolean']  = (bool) $value,
                'multi_select',
                'range'        => $row['value_json']     = is_array($value) ? $value : json_decode($value, true),
                default        => $row['value_text']     = (string) $value,
            };

            ProductSpecValue::updateOrCreate(
                ['product_id' => $product->id, 'spec_definition_id' => $defId],
                $row
            );
        }
    }
}
