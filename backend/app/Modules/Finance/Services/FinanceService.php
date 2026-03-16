<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\Transaction;
use Illuminate\Support\Facades\Auth;

class FinanceService
{
    public function createTransaction(array $data): Transaction
    {
        return Transaction::create(array_merge($data, [
            'created_by' => Auth::id(),
        ]));
    }

    public function updateTransaction(Transaction $transaction, array $data): Transaction
    {
        $transaction->update($data);
        return $transaction->fresh();
    }
}
