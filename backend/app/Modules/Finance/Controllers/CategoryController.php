<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /categories
    public function index(Request $request): JsonResponse
    {
        $query = Category::query()->orderBy('type')->orderBy('name');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if (!$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        return response()->json($query->get());
    }

    // GET /categories/tree
    public function tree(Request $request): JsonResponse
    {
        $query = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('type')
            ->orderBy('name');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if (!$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        return response()->json($query->get());
    }

    // GET /categories/{id}
    public function show(Category $category): JsonResponse
    {
        return response()->json($category);
    }

    // POST /categories
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'type'        => ['required', 'in:Income,Expense'],
            'parent_id'   => ['nullable', 'integer', 'exists:finance_categories,id'],
            'description' => ['nullable', 'string'],
            'color'       => ['nullable', 'string', 'max:20'],
            'icon'        => ['nullable', 'string', 'max:100'],
            'is_active'   => ['nullable', 'boolean'],
        ]);

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    // PUT /categories/{id}
    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'type'        => ['sometimes', 'in:Income,Expense'],
            'parent_id'   => ['nullable', 'integer', 'exists:finance_categories,id'],
            'description' => ['nullable', 'string'],
            'color'       => ['nullable', 'string', 'max:20'],
            'icon'        => ['nullable', 'string', 'max:100'],
            'is_active'   => ['nullable', 'boolean'],
        ]);

        $category->update($data);

        return response()->json($category->fresh());
    }

    // DELETE /categories/{id}
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
