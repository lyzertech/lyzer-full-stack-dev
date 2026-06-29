<?php

namespace App\Modules\{{ModuleName}}\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\{{ModuleName}}\Models\{{ModelName}};
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * {{ModelName}} Controller
 * Following Lyzer modular architecture rules
 */
class {{ModelName}}Controller extends Controller
{
    /**
     * Display a listing of the resource
     */
    public function index(): JsonResponse
    {
        try {
            ${{modelNameLower}} = {{ModelName}}::all();
            
            return response()->json([
                'success' => true,
                'data' => ${{modelNameLower}}
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch {{modelNameLower}}',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                // Add your validation rules here
            ]);

            ${{modelNameLower}} = {{ModelName}}::create($validated);

            return response()->json([
                'success' => true,
                'message' => '{{ModelName}} created successfully',
                'data' => ${{modelNameLower}}
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create {{modelNameLower}}',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource
     */
    public function show({{ModelName}} ${{modelNameLower}}): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => ${{modelNameLower}}
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch {{modelNameLower}}',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource
     */
    public function update(Request $request, {{ModelName}} ${{modelNameLower}}): JsonResponse
    {
        try {
            $validated = $request->validate([
                // Add your validation rules here
            ]);

            ${{modelNameLower}}->update($validated);

            return response()->json([
                'success' => true,
                'message' => '{{ModelName}} updated successfully',
                'data' => ${{modelNameLower}}
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update {{modelNameLower}}',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource
     */
    public function destroy({{ModelName}} ${{modelNameLower}}): JsonResponse
    {
        try {
            ${{modelNameLower}}->delete();

            return response()->json([
                'success' => true,
                'message' => '{{ModelName}} deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete {{modelNameLower}}',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}