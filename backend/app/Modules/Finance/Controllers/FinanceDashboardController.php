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
            'SELECT COALESCE(SUM(current_balance), 0) as total FROM finance_accounts WHERE is_active = true'
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
            'SELECT COUNT(*) as count FROM finance_accounts WHERE is_active = true'
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
             WHERE a.is_active = true
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

    /**
     * Get account balance history over time
     */
    public function balanceHistory(Request $request): JsonResponse
    {
        $days = $request->integer('days', 30);
        $accountIds = $request->input('account_ids', []); // optional filter

        $startDate = now()->subDays($days)->startOfDay();

        // Build account filter
        $accountFilter = '';
        $accountParams = [];
        if (!empty($accountIds) && is_array($accountIds)) {
            $placeholders = implode(',', array_fill(0, count($accountIds), '?'));
            $accountFilter = "AND t.account_id IN ({$placeholders})";
            $accountParams = $accountIds;
        }

        // Get all transactions within the date range, ordered by date and time
        $transactions = DB::select(
            "SELECT 
                t.id,
                t.account_id,
                t.transaction_date,
                t.transaction_type,
                t.amount,
                t.balance_after,
                t.created_at,
                a.name AS account_name
             FROM finance_transactions t
             INNER JOIN finance_accounts a ON t.account_id = a.id
             WHERE t.transaction_date >= ? {$accountFilter}
             ORDER BY t.transaction_date ASC, t.created_at ASC",
            array_merge([$startDate->format('Y-m-d')], $accountParams)
        );

        // Group by account and build time series
        $accountSeries = [];
        $accountInitialBalances = [];

        // Get initial balances for each account (balance before the date range)
        $accounts = DB::select(
            "SELECT DISTINCT
                a.id,
                a.name,
                a.current_balance,
                b.name AS bank_name
             FROM finance_accounts a
             INNER JOIN finance_banks b ON a.bank_id = b.id
             INNER JOIN finance_transactions t ON a.id = t.account_id
             WHERE a.is_active = true {$accountFilter}",
            $accountParams
        );

        foreach ($accounts as $account) {
            $accountId = (int) $account->id;
            $accountName = (string) $account->name;
            $bankName = (string) $account->bank_name;
            
            // Get the last transaction before the start date to find initial balance
            $lastTxBeforeStart = DB::selectOne(
                "SELECT balance_after 
                 FROM finance_transactions 
                 WHERE account_id = ? AND transaction_date < ?
                 ORDER BY transaction_date DESC, created_at DESC 
                 LIMIT 1",
                [$accountId, $startDate->format('Y-m-d')]
            );

            $initialBalance = $lastTxBeforeStart 
                ? (float) $lastTxBeforeStart->balance_after 
                : 0.0;

            $accountInitialBalances[$accountId] = $initialBalance;
            $accountSeries[$accountId] = [
                'account_id' => $accountId,
                'account_name' => $accountName,
                'bank_name' => $bankName,
                'data' => []
            ];

            // Add initial data point at the start date
            $accountSeries[$accountId]['data'][] = [
                'date' => $startDate->format('Y-m-d'),
                'balance' => $initialBalance
            ];
        }

        // Process transactions and build transaction map
        $transactionsByAccount = [];
        foreach ($transactions as $tx) {
            $accountId = (int) $tx->account_id;
            $date = $tx->transaction_date;
            $balance = (float) $tx->balance_after;

            if (!isset($transactionsByAccount[$accountId])) {
                $transactionsByAccount[$accountId] = [];
            }
            
            // Store the last balance for this date (in case of multiple transactions per day)
            $transactionsByAccount[$accountId][$date] = $balance;
        }

        // Generate daily data points for all accounts
        $endDate = now();
        $currentDate = clone $startDate;
        
        foreach ($accountSeries as $accountId => &$series) {
            $lastBalance = $accountInitialBalances[$accountId];
            
            // Clear the initial data array (we'll rebuild it with all dates)
            $series['data'] = [];
            
            $dateIterator = clone $startDate;
            while ($dateIterator <= $endDate) {
                $dateStr = $dateIterator->format('Y-m-d');
                
                // If there's a transaction on this date, use that balance
                if (isset($transactionsByAccount[$accountId][$dateStr])) {
                    $lastBalance = $transactionsByAccount[$accountId][$dateStr];
                }
                
                // Add data point for this date
                $series['data'][] = [
                    'date' => $dateStr,
                    'balance' => $lastBalance
                ];
                
                $dateIterator->addDay();
            }
        }

        return response()->json([
            'series' => array_values($accountSeries),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d')
        ]);
    }
}
