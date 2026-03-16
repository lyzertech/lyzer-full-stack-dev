<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Transaction;
use App\Modules\Finance\Requests\TransactionRequest;
use App\Modules\Finance\Services\FinanceService;
use Illuminate\Http\JsonResponse;

class TransactionController extends Controller
{
    public function __construct(protected FinanceService $service) {}

    public function index(): JsonResponse
    {
        $transactions = Transaction::latest()->paginate(15);
        return response()->json($transactions);
    }

    public function store(TransactionRequest $request): JsonResponse
    {
        $transaction = $this->service->createTransaction($request->validated());
        return response()->json($transaction, 201);
    }

    public function show(Transaction $transaction): JsonResponse
    {
        return response()->json($transaction);
    }

    public function update(TransactionRequest $request, Transaction $transaction): JsonResponse
    {
        $updated = $this->service->updateTransaction($transaction, $request->validated());
        return response()->json($updated);
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted.']);
    }
}
