<?php

namespace App\Modules\Labs\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Labs\Models\SpecDefinition;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SpecDefinitionController extends Controller
{
    public function index(Request $request)
    {
        $query = SpecDefinition::query();

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('spec_name', 'like', '%' . $request->search . '%')
                  ->orWhere('spec_key', 'like', '%' . $request->search . '%')
                  ->orWhere('group_name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('group_name')) {
            $query->where('group_name', $request->group_name);
        }

        if ($request->has('data_type')) {
            $query->where('data_type', $request->data_type);
        }

        if ($request->boolean('filterable_only')) {
            $query->where('is_filterable', true);
        }

        return response()->json(
            $query->orderBy('group_name')->orderBy('sort_order')->orderBy('spec_name')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'spec_name'     => 'required|string|max:255',
            'spec_key'      => 'nullable|string|max:100',
            'data_type'     => 'required|in:text,number,decimal,boolean,select,multi_select,range',
            'unit'          => 'nullable|string|max:50',
            'group_name'    => 'nullable|string|max:100',
            'options'       => 'nullable|array',
            'options.*'     => 'string',
            'is_filterable' => 'boolean',
            'sort_order'    => 'integer',
            'description'   => 'nullable|string',
        ]);

        // Auto-generate spec_key from spec_name if not provided
        if (empty($validated['spec_key'])) {
            $validated['spec_key'] = Str::slug($validated['spec_name'], '_');
        }

        $spec = SpecDefinition::create($validated);
        return response()->json($spec, 201);
    }

    public function show($id)
    {
        return response()->json(SpecDefinition::with('categories')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $spec = SpecDefinition::findOrFail($id);

        $validated = $request->validate([
            'spec_name'     => 'sometimes|string|max:255',
            'spec_key'      => 'sometimes|string|max:100|unique:labs_spec_definitions,spec_key,' . $id,
            'data_type'     => 'sometimes|in:text,number,decimal,boolean,select,multi_select,range',
            'unit'          => 'nullable|string|max:50',
            'group_name'    => 'nullable|string|max:100',
            'options'       => 'nullable|array',
            'options.*'     => 'string',
            'is_filterable' => 'boolean',
            'sort_order'    => 'integer',
            'description'   => 'nullable|string',
        ]);

        $spec->update($validated);
        return response()->json($spec);
    }

    public function destroy($id)
    {
        SpecDefinition::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    /**
     * GET /labs/spec-definitions/groups
     * Returns distinct group names for UI grouping.
     */
    public function groups()
    {
        $groups = SpecDefinition::whereNotNull('group_name')
            ->distinct()
            ->orderBy('group_name')
            ->pluck('group_name');

        return response()->json($groups);
    }
}
