<?php

namespace App\Modules\Sales\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Sales\Models\Customer;
use App\Modules\Sales\Requests\CustomerRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * GET /api/v1/sales/customers
     * Returns a flat array of all active customers (no pagination for now).
     */
    public function index(Request $request): JsonResponse
    {
        $customers = Customer::query()
            ->when($request->query('area'), fn($q, $area) => $q->where('area', $area))
            ->when($request->query('sales'), fn($q, $sales) => $q->where('sales', $sales))
            ->when($request->query('status'), fn($q, $status) => $q->where('status', $status))
            ->when($request->query('q'), function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_code', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();

        return response()->json($customers);
    }

    /**
     * POST /api/v1/sales/customers
     * Creates a new customer and auto-generates the customer_code.
     */
    public function store(CustomerRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Auto-generate CUST-XXXXXX code
        $lastId = Customer::withTrashed()->max('id') ?? 0;
        $data['customer_code'] = 'CUST-' . str_pad($lastId + 1, 6, '0', STR_PAD_LEFT);

        // Default status to Active if not provided
        $data['status'] = $data['status'] ?? 'Active';

        $customer = Customer::create($data);

        return response()->json($customer, 201);
    }

    /**
     * GET /api/v1/sales/customers/{customer}
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json($customer);
    }

    /**
     * PUT /api/v1/sales/customers/{customer}
     */
    public function update(CustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validated());
        return response()->json($customer->fresh());
    }

    /**
     * DELETE /api/v1/sales/customers/{customer}
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted.']);
    }
}
