/**
 * @deprecated Use `@/app/actions/finance/transactions.actions` (client API via apiClient).
 *
 * Interfaces are kept here only for backwards-compatibility with any
 * existing imports. No database code remains in this file.
 */

export type {
  Transaction,
  CreateTransactionInput,
  TransactionFilters,
} from '@/app/actions/finance/transactions.actions'

/** @deprecated Use Transaction from transactions.actions */
export type TransactionWithDetails =
  import('@/app/actions/finance/transactions.actions').Transaction
