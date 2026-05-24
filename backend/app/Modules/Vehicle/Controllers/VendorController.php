<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vendor::withCount('workOrders')->orderBy('workshop_name');

        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(fn($q) => $q->where('workshop_name', 'like', "%{$s}%")
                ->orWhere('contact_person', 'like', "%{$s}%")
                ->orWhere('city', 'like', "%{$s}%"));
        }

        if ($request->filled('vendor_type')) $query->where('vendor_type', $request->string('vendor_type'));
        if ($request->boolean('active_only')) $query->where('is_active', 1);

        $perPage = min($request->integer('per_page', 15), 100);
        return response()->json($query->paginate($perPage));
    }

    public function show(Vendor $vendor): JsonResponse
    {
        $vendor->load(['workOrders' => fn($q) => $q->with('vehicle')->orderBy('service_date', 'desc')->limit(10)]);
        return response()->json($vendor);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'workshop_name'  => ['required', 'string', 'max:200'],
            'contact_person' => ['nullable', 'string', 'max:150'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            'address'        => ['nullable', 'string'],
            'city'           => ['nullable', 'string', 'max:100'],
            'vendor_type'    => ['nullable', 'in:Internal Workshop,External Workshop,Dealer,Specialist'],
            'rating'         => ['nullable', 'integer', 'min:1', 'max:5'],
            'service_notes'  => ['nullable', 'string'],
            'is_active'      => ['nullable', 'boolean'],
        ]);

        // Auto-generate vendor code
        $count = Vendor::withTrashed()->count() + 1;
        $data['vendor_code'] = 'VND-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $vendor = Vendor::create($data);
        return response()->json($vendor, 201);
    }

    public function update(Request $request, Vendor $vendor): JsonResponse
    {
        $data = $request->validate([
            'workshop_name'  => ['sometimes', 'string', 'max:200'],
            'contact_person' => ['nullable', 'string', 'max:150'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            'address'        => ['nullable', 'string'],
            'city'           => ['nullable', 'string', 'max:100'],
            'vendor_type'    => ['nullable', 'in:Internal Workshop,External Workshop,Dealer,Specialist'],
            'rating'         => ['nullable', 'integer', 'min:1', 'max:5'],
            'service_notes'  => ['nullable', 'string'],
            'is_active'      => ['nullable', 'boolean'],
        ]);

        $vendor->update($data);
        return response()->json($vendor->fresh());
    }

    public function destroy(Vendor $vendor): JsonResponse
    {
        $vendor->delete();
        return response()->json(['message' => 'Vendor deleted']);
    }
}
