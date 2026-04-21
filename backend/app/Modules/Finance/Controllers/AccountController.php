<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    // GET /accounts
    public function index(Request $request): JsonResponse
    {
        $query = Account::with('bank')->orderBy('name');

        if (!$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        if ($request->filled('bank_id')) {
            $query->where('bank_id', $request->integer('bank_id'));
        }

        $accounts = $query->get()->map(fn($a) => $this->formatAccount($a));

        return response()->json($accounts);
    }

    // GET /accounts/{id}
    public function show(Account $account): JsonResponse
    {
        $account->load('bank');
        return response()->json($this->formatAccount($account));
    }

    // POST /accounts
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'bank_id'        => ['required', 'integer', 'exists:finance_banks,id'],
            'name'           => ['required', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'account_type'   => ['nullable', 'in:Checking,Savings,Credit,Investment,Cash,Other'],
            'currency'       => ['nullable', 'string', 'max:10'],
            'initial_balance'=> ['nullable', 'numeric'],
            'notes'          => ['nullable', 'string'],
            'is_active'      => ['nullable', 'boolean'],
        ]);

        $initialBalance = $data['initial_balance'] ?? 0;
        $data['current_balance'] = $initialBalance;
        $data['initial_balance'] = $initialBalance;

        $account = Account::create($data);
        $account->load('bank');

        return response()->json($this->formatAccount($account), 201);
    }

    // PUT /accounts/{id}
    public function update(Request $request, Account $account): JsonResponse
    {
        $data = $request->validate([
            'bank_id'        => ['sometimes', 'integer', 'exists:finance_banks,id'],
            'name'           => ['sometimes', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'account_type'   => ['nullable', 'in:Checking,Savings,Credit,Investment,Cash,Other'],
            'currency'       => ['nullable', 'string', 'max:10'],
            'notes'          => ['nullable', 'string'],
            'is_active'      => ['nullable', 'boolean'],
        ]);

        $account->update($data);
        $account->load('bank');

        return response()->json($this->formatAccount($account->fresh()));
    }

    // DELETE /accounts/{id}
    public function destroy(Account $account): JsonResponse
    {
        $account->delete();

        return response()->json(['message' => 'Account deleted.']);
    }

    private function formatAccount(Account $account): array
    {
        return array_merge($account->toArray(), [
            'bank_name' => $account->bank?->name,
            'bank_code' => $account->bank?->code,
        ]);
    }
}
