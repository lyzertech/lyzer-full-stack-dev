/**
 * @deprecated All DB access has been migrated to the Laravel backend.
 * Use `@/app/actions/finance/transactions.actions` instead.
 *
 * Interfaces are kept here only for backwards-compatibility with any
 * existing imports. No database code remains in this file.
 */

export type {
  Transaction,
  CreateTransactionInput,
  TransactionFilters,
} from '@/app/actions/finance/transactions.actions'
