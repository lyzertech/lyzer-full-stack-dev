import { apiClient } from '@/lib/api-client'
import type { Account } from '@/app/actions/finance/accounts.actions'
import type { Bank } from '@/app/actions/finance/banks.actions'
import type { Category } from '@/app/actions/finance/categories.actions'
import type { Transaction } from '@/app/actions/finance/transactions.actions'

export interface FinanceReferenceData {
  banks: Bank[]
  accounts: Account[]
  categories: Category[]
  transactions?: Transaction[]
}

/** One API call for finance form/list bootstrap (important on live API). */
export async function getFinanceReference(
  options?: {
    includeInactive?: boolean
    categoryType?: 'Income' | 'Expense'
    transactionsLimit?: number
  }
): Promise<FinanceReferenceData> {
  const params = new URLSearchParams()
  if (options?.includeInactive) params.set('include_inactive', '1')
  if (options?.categoryType) params.set('category_type', options.categoryType)
  if (options?.transactionsLimit) {
    params.set('transactions_limit', String(options.transactionsLimit))
  }
  const qs = params.toString()
  const { data } = await apiClient.get(`/finance/reference${qs ? `?${qs}` : ''}`)
  return data as FinanceReferenceData
}
