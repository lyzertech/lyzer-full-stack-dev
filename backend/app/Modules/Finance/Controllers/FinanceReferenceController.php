<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\Bank;
use App\Modules\Finance\Models\Category;
use App\Modules\Finance\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

/**
 * Single-request bootstrap for finance forms (banks, accounts, categories).
 */
class FinanceReferenceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $banks = Bank::query()
            ->orderBy('name')
            ->when(! $request->boolean('include_inactive'), fn ($q) => $q->where('is_active', true))
            ->get();

        $accounts = Account::with('bank')
            ->orderBy('name')
            ->when(! $request->boolean('include_inactive'), fn ($q) => $q->where('is_active', true))
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'bank_id' => $account->bank_id,
                    'name' => $account->name,
                    'account_number' => $account->account_number,
                    'account_type' => $account->account_type,
                    'currency' => $account->currency,
                    'initial_balance' => $account->initial_balance,
                    'current_balance' => $account->current_balance,
                    'notes' => $account->notes,
                    'is_active' => $account->is_active,
                    'created_at' => $account->created_at,
                    'updated_at' => $account->updated_at,
                    'bank_name' => $account->bank?->name,
                    'bank_code' => $account->bank?->code,
                ];
            });

        $categories = Category::query()
            ->orderBy('name')
            ->when(! $request->boolean('include_inactive'), fn ($q) => $q->where('is_active', true))
            ->when($request->filled('category_type'), fn ($q) => $q->where('type', $request->string('category_type')))
            ->get();

        $payload = [
            'banks' => $banks,
            'accounts' => $accounts,
            'categories' => $categories,
        ];

        $txLimit = $request->integer('transactions_limit', 0);
        if ($txLimit > 0 && Schema::hasTable('finance_transactions')) {
            $payload['transactions'] = Transaction::with(['account.bank', 'transferToAccount', 'category'])
                ->orderBy('transaction_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit($txLimit)
                ->get()
                ->map(fn (Transaction $t) => array_merge($t->attributesToArray(), [
                    'account_name' => $t->account?->name,
                    'account_type' => $t->account?->account_type,
                    'bank_name' => $t->account?->bank?->name,
                    'transfer_to_account_name' => $t->transferToAccount?->name,
                    'category_name' => $t->category?->name,
                    'category_type' => $t->category?->type,
                ]));
        }

        return response()->json($payload);
    }
}
