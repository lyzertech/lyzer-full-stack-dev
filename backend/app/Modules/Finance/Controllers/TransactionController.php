<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Account;
use App\Modules\Finance\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TransactionController extends Controller
{
    // GET /transactions
    public function index(Request $request): JsonResponse
    {
        if (! Schema::hasTable('finance_transactions')) {
            return response()->json([
                'error' => 'Table finance_transactions does not exist. Run: php artisan migrate',
            ], 503);
        }

        $query = Transaction::with(['account.bank', 'transferToAccount', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->filled('account_id')) {
            $query->where('account_id', $request->integer('account_id'));
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }
        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->string('transaction_type'));
        }
        if ($request->filled('start_date')) {
            $query->where('transaction_date', '>=', $request->string('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->where('transaction_date', '<=', $request->string('end_date'));
        }

        $limit = $request->integer('limit', 0);
        if ($limit > 0) {
            $query->limit($limit)->offset($request->integer('offset', 0));
        }

        $transactions = $query->get()->map(fn($t) => $this->formatTransaction($t));

        return response()->json($transactions);
    }

    // GET /transactions/{id}
    public function show(Transaction $transaction): JsonResponse
    {
        $transaction->load(['account.bank', 'transferToAccount', 'category']);

        return response()->json($this->formatTransaction($transaction));
    }

    // POST /transactions
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'transaction_type'        => ['required', 'in:Income,Expense,Transfer'],
            'account_id'              => ['required', 'integer', 'exists:finance_accounts,id'],
            'transfer_to_account_id'  => ['nullable', 'integer', 'exists:finance_accounts,id'],
            'category_id'             => ['nullable', 'integer', 'exists:finance_categories,id'],
            'amount'                  => ['required', 'numeric', 'min:0.01'],
            'description'             => ['nullable', 'string'],
            'reference_number'        => ['nullable', 'string', 'max:100'],
            'transaction_date'        => ['required', 'date'],
            'notes'                   => ['nullable', 'string'],
        ]);

        // Business validation
        if (in_array($data['transaction_type'], ['Income', 'Expense']) && empty($data['category_id'])) {
            return response()->json(['error' => 'Category is required for Income/Expense transactions.'], 422);
        }
        if ($data['transaction_type'] === 'Transfer' && empty($data['transfer_to_account_id'])) {
            return response()->json(['error' => 'Destination account is required for Transfer transactions.'], 422);
        }
        if (
            $data['transaction_type'] === 'Transfer'
            && isset($data['transfer_to_account_id'])
            && $data['account_id'] === $data['transfer_to_account_id']
        ) {
            return response()->json(['error' => 'Cannot transfer to the same account.'], 422);
        }

        $transaction = DB::transaction(function () use ($data) {
            $sourceAccount = Account::lockForUpdate()->findOrFail($data['account_id']);
            $currentBalance = (float) $sourceAccount->current_balance;

            if ($data['transaction_type'] === 'Income') {
                $balanceAfter = $currentBalance + $data['amount'];
            } elseif ($data['transaction_type'] === 'Expense') {
                $balanceAfter = $currentBalance - $data['amount'];
            } else {
                // Transfer
                $destAccount = Account::lockForUpdate()->findOrFail($data['transfer_to_account_id']);
                $balanceAfter = $currentBalance - $data['amount'];

                $destAccount->update([
                    'current_balance' => (float) $destAccount->current_balance + $data['amount'],
                ]);
            }

            $data['balance_after'] = $balanceAfter;
            $tx = Transaction::create($data);

            $sourceAccount->update(['current_balance' => $balanceAfter]);

            return $tx;
        });

        $transaction->load(['account.bank', 'transferToAccount', 'category']);

        return response()->json($this->formatTransaction($transaction), 201);
    }

    // DELETE /transactions/{id}
    public function destroy(Transaction $transaction): JsonResponse
    {
        // Intentionally blocked — use a reversal transaction instead
        return response()->json(
            ['error' => 'Transaction deletion not supported. Use a reversal transaction instead.'],
            422
        );
    }

    private function formatTransaction(Transaction $t): array
    {
        return array_merge($t->attributesToArray(), [
            'account_name'             => $t->account?->name,
            'account_type'             => $t->account?->account_type,
            'bank_name'                => $t->account?->bank?->name,
            'transfer_to_account_name' => $t->transferToAccount?->name,
            'category_name'            => $t->category?->name,
            'category_type'            => $t->category?->type,
        ]);
    }
}
