<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Bank;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankController extends Controller
{
    // GET /banks
    public function index(Request $request): JsonResponse
    {
        $query = Bank::query()->orderBy('name');

        if (!$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        return response()->json($query->get());
    }

    // GET /banks/{id}
    public function show(Bank $bank): JsonResponse
    {
        return response()->json($bank);
    }

    // POST /banks
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'code'           => ['nullable', 'string', 'max:50'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'routing_number' => ['nullable', 'string', 'max:50'],
            'branch'         => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_phone'  => ['nullable', 'string', 'max:50'],
            'contact_email'  => ['nullable', 'email', 'max:255'],
            'website'        => ['nullable', 'url', 'max:255'],
            'notes'          => ['nullable', 'string'],
            'is_active'      => ['nullable', 'boolean'],
        ]);

        $bank = Bank::create($data);

        return response()->json($bank, 201);
    }

    // PUT /banks/{id}
    public function update(Request $request, Bank $bank): JsonResponse
    {
        $data = $request->validate([
            'name'           => ['sometimes', 'string', 'max:255'],
            'code'           => ['nullable', 'string', 'max:50'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'routing_number' => ['nullable', 'string', 'max:50'],
            'branch'         => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_phone'  => ['nullable', 'string', 'max:50'],
            'contact_email'  => ['nullable', 'email', 'max:255'],
            'website'        => ['nullable', 'url', 'max:255'],
            'notes'          => ['nullable', 'string'],
            'is_active'      => ['nullable', 'boolean'],
        ]);

        $bank->update($data);

        return response()->json($bank->fresh());
    }

    // DELETE /banks/{id}
    public function destroy(Bank $bank): JsonResponse
    {
        $bank->delete();

        return response()->json(['message' => 'Bank deleted.']);
    }
}
