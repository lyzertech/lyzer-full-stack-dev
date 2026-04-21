<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $dateFilter = '';
        $dateParams = [];

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $dateFilter = 'AND t.transaction_date BETWEEN ? AND ?';
            $dateParams = [$request->string('start_date'), $request->string('end_date')];
        } elseif ($request->filled('start_date')) {
            $dateFilter = 'AND t.transaction_date >= ?';
            $dateParams = [$request->string('start_date')];
        } elseif ($request->filled('end_date')) {
            $dateFilter = 'AND t.transaction_date <= ?';
            $dateParams = [$request->string('end_date')];
        }

        // Total balance across all active accounts
        $totalBalance = (float) DB::selectOne(
            'SELECT COALESCE(SUM(current_balance), 0) as total FROM finance_accounts WHERE is_active = 1'
        )->total;

        // Income / Expense / count summary
        $summaryRow = DB::selectOne(
            "SELECT
                COALESCE(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END), 0) AS total_expense,
                COUNT(*) AS transaction_count
             FROM finance_transactions t
             WHERE 1=1 {$dateFilter}",
            $dateParams
        );

        $totalIncome      = (float) $summaryRow->total_income;
        $totalExpense     = (float) $summaryRow->total_expense;
        $transactionCount = (int)   $summaryRow->transaction_count;
        $netIncome        = $totalIncome - $totalExpense;

        // Account count
        $accountCount = (int) DB::selectOne(
            'SELECT COUNT(*) as count FROM finance_accounts WHERE is_active = 1'
        )->count;

        // Recent 10 transactions
        $recentTransactions = DB::select(
            "SELECT
                t.*,
                a.name          AS account_name,
                a.account_type,
                b.name          AS bank_name,
                a2.name         AS transfer_to_account_name,
                c.name          AS category_name,
                c.type          AS category_type
             FROM finance_transactions t
             INNER JOIN finance_accounts  a  ON t.account_id              = a.id
             INNER JOIN finance_banks     b  ON a.bank_id                 = b.id
             LEFT  JOIN finance_accounts  a2 ON t.transfer_to_account_id  = a2.id
             LEFT  JOIN finance_categories c ON t.category_id             = c.id
             ORDER BY t.transaction_date DESC, t.created_at DESC
             LIMIT 10"
        );

        // Top 10 categories by amount
        $topCategories = DB::select(
            "SELECT
                c.id   AS category_id,
                c.name AS category_name,
                SUM(t.amount)  AS total_amount,
                COUNT(*)       AS transaction_count
             FROM finance_transactions t
             INNER JOIN finance_categories c ON t.category_id = c.id
             WHERE t.transaction_type IN ('Income','Expense') {$dateFilter}
             GROUP BY c.id, c.name
             ORDER BY total_amount DESC
             LIMIT 10",
            $dateParams
        );

        // Account balances
        $accountBalances = DB::select(
            "SELECT
                a.id             AS account_id,
                a.name           AS account_name,
                b.name           AS bank_name,
                a.current_balance
             FROM finance_accounts a
             INNER JOIN finance_banks b ON a.bank_id = b.id
             WHERE a.is_active = 1
             ORDER BY a.current_balance DESC"
        );

        return response()->json([
            'totalBalance'      => $totalBalance,
            'totalIncome'       => $totalIncome,
            'totalExpense'      => $totalExpense,
            'netIncome'         => $netIncome,
            'accountCount'      => $accountCount,
            'transactionCount'  => $transactionCount,
            'recentTransactions'=> $recentTransactions,
            'topCategories'     => array_map(fn($r) => [
                'category_id'       => (int)   $r->category_id,
                'category_name'     => (string) $r->category_name,
                'total_amount'      => (float)  $r->total_amount,
                'transaction_count' => (int)    $r->transaction_count,
            ], $topCategories),
            'accountBalances'   => array_map(fn($r) => [
                'account_id'      => (int)   $r->account_id,
                'account_name'    => (string) $r->account_name,
                'bank_name'       => (string) $r->bank_name,
                'current_balance' => (float)  $r->current_balance,
            ], $accountBalances),
        ]);
    }
}
