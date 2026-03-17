# Finance Module - Personal Finance Management

## Overview

A comprehensive personal finance management module built with clean architecture principles, following the school module template pattern.

## Features

- ✅ **Manage Banks and Accounts** - Full CRUD operations for banks and accounts
- ✅ **Ledger-based Transactions** - Track all financial transactions with automatic balance updates
- ✅ **Transfer Between Accounts** - Secure transfer logic with transaction handling
- ✅ **Expense & Income Categorization** - Hierarchical category system
- ✅ **Financial Dashboard** - Comprehensive summary with analytics

## Architecture

### Clean Architecture Layers

1. **Database Layer** (`db/`)
   - SQL schema files for all tables
   - Migration-ready structure

2. **Repository Layer** (`lib/finance/repositories/`)
   - Database access logic
   - Type-safe interfaces
   - Business logic separation

3. **Server Actions Layer** (`app/actions/finance/`)
   - Server-side CRUD operations
   - Validation and error handling
   - Transaction management

4. **UI Layer** (`app/(components)/(content-layout)/finance/`)
   - React components
   - Client-side state management
   - User interface

## Folder Structure

```
finance/
├── db/
│   ├── create_finance_banks_table.sql
│   ├── create_finance_accounts_table.sql
│   ├── create_finance_categories_table.sql
│   ├── create_finance_transactions_table.sql
│   └── create_all_finance_tables.sql
│
├── lib/finance/repositories/
│   ├── banks.repository.ts
│   ├── accounts.repository.ts
│   ├── categories.repository.ts
│   ├── transactions.repository.ts
│   └── index.ts
│
├── app/actions/finance/
│   ├── banks.actions.ts
│   ├── accounts.actions.ts
│   ├── categories.actions.ts
│   ├── transactions.actions.ts
│   └── dashboard.actions.ts
│
└── app/(components)/(content-layout)/finance/
    ├── dashboard/
    │   └── page.tsx
    ├── banks/
    │   └── page.tsx
    ├── accounts/
    │   └── page.tsx
    ├── categories/
    │   └── page.tsx
    └── transactions/
        └── page.tsx
```

## Database Schema

### Tables

1. **finance_banks** - Bank information
   - id, name, code, account_number, routing_number, branch
   - contact_person, contact_phone, contact_email, website
   - notes, is_active, created_at, updated_at

2. **finance_accounts** - Account information
   - id, bank_id (FK), name, account_number
   - account_type (Checking, Savings, Credit, Investment, Cash, Other)
   - currency, initial_balance, current_balance
   - notes, is_active, created_at, updated_at

3. **finance_categories** - Income/Expense categories
   - id, name, type (Income/Expense)
   - parent_id (FK, self-referencing for hierarchy)
   - description, color, icon, is_active
   - created_at, updated_at

4. **finance_transactions** - Ledger-based transactions
   - id, transaction_type (Income/Expense/Transfer)
   - account_id (FK), transfer_to_account_id (FK, for transfers)
   - category_id (FK, for Income/Expense)
   - amount, balance_after (account balance after transaction)
   - description, reference_number, transaction_date
   - notes, created_at, updated_at

## Server Actions

### Banks (`app/actions/finance/banks.actions.ts`)
- `getBanks(includeInactive?)` - List all banks
- `getBankById(id)` - Get single bank
- `createBank(input)` - Create new bank
- `updateBank(input)` - Update bank
- `deleteBank(id)` - Delete bank

### Accounts (`app/actions/finance/accounts.actions.ts`)
- `getAccounts(includeInactive?)` - List all accounts with bank info
- `getAccountById(id)` - Get single account
- `getAccountsByBankId(bankId)` - Get accounts for a bank
- `createAccount(input)` - Create new account
- `updateAccount(input)` - Update account
- `deleteAccount(id)` - Delete account

### Categories (`app/actions/finance/categories.actions.ts`)
- `getCategories(type?, includeInactive?)` - List categories
- `getCategoryById(id)` - Get single category
- `getCategoryTree(type?)` - Get hierarchical category tree
- `createCategory(input)` - Create new category
- `updateCategory(input)` - Update category
- `deleteCategory(id)` - Delete category

### Transactions (`app/actions/finance/transactions.actions.ts`)
- `getTransactions(filters?)` - List transactions with filters
- `getTransactionById(id)` - Get single transaction
- `createTransaction(input)` - Create transaction (Income/Expense/Transfer)
- `transferBetweenAccounts(fromId, toId, amount, description?, date?)` - Transfer helper

### Dashboard (`app/actions/finance/dashboard.actions.ts`)
- `getDashboardSummary(startDate?, endDate?)` - Complete dashboard data
- `getMonthlySummary(year?, months?)` - Monthly financial summary
- `getAccountSummary(accountId)` - Account-specific summary

## Transaction Logic

### Ledger-Based System

All transactions automatically update account balances:
- **Income**: Adds to account balance
- **Expense**: Subtracts from account balance
- **Transfer**: Subtracts from source, adds to destination

### Transfer Implementation

The `transferBetweenAccounts` function:
1. Validates both accounts exist
2. Checks source account has sufficient balance
3. Uses database transactions for atomicity
4. Creates transaction record for source account (debit)
5. Updates destination account balance (credit)
6. Updates source account balance
7. All operations are wrapped in a database transaction

### Balance Calculation

Account balances are maintained in real-time:
- `current_balance` in `finance_accounts` table
- Each transaction stores `balance_after` for audit trail
- Balances are calculated and updated atomically

## Dashboard Queries

### Summary Metrics
- Total balance across all accounts
- Total income and expenses for period
- Net income calculation
- Account and transaction counts

### Analytics
- Recent transactions (last 10)
- Top categories by amount
- Account balances breakdown
- Monthly summaries

## Usage Examples

### Creating a Bank
```typescript
import { createBank } from '@/app/actions/finance/banks.actions'

await createBank({
  name: 'Chase Bank',
  code: 'CHASE',
  branch: 'Main Branch',
  is_active: true
})
```

### Creating an Account
```typescript
import { createAccount } from '@/app/actions/finance/accounts.actions'

await createAccount({
  bank_id: 1,
  name: 'Checking Account',
  account_type: 'Checking',
  currency: 'USD',
  initial_balance: 1000.00
})
```

### Recording a Transaction
```typescript
import { createTransaction } from '@/app/actions/finance/transactions.actions'

// Income
await createTransaction({
  transaction_type: 'Income',
  account_id: 1,
  category_id: 5,
  amount: 5000.00,
  description: 'Salary',
  transaction_date: new Date()
})

// Expense
await createTransaction({
  transaction_type: 'Expense',
  account_id: 1,
  category_id: 10,
  amount: 150.00,
  description: 'Groceries',
  transaction_date: new Date()
})
```

### Transfer Between Accounts
```typescript
import { transferBetweenAccounts } from '@/app/actions/finance/transactions.actions'

await transferBetweenAccounts(
  1, // from account
  2, // to account
  500.00, // amount
  'Monthly savings transfer',
  new Date()
)
```

### Getting Dashboard Data
```typescript
import { getDashboardSummary } from '@/app/actions/finance/dashboard.actions'

const summary = await getDashboardSummary()
console.log(summary.totalBalance)
console.log(summary.totalIncome)
console.log(summary.recentTransactions)
```

## Setup Instructions

1. **Create Database Tables**
   ```sql
   SOURCE db/create_finance_banks_table.sql;
   SOURCE db/create_finance_accounts_table.sql;
   SOURCE db/create_finance_categories_table.sql;
   SOURCE db/create_finance_transactions_table.sql;
   ```

2. **Access Pages**
   - Dashboard: `/finance/dashboard`
   - Banks: `/finance/banks`
   - Accounts: `/finance/accounts`
   - Categories: `/finance/categories`
   - Transactions: `/finance/transactions`

## Best Practices

1. **Always use server actions** - Never call repositories directly from UI
2. **Validate input** - Server actions include validation
3. **Handle errors** - All actions throw descriptive errors
4. **Use transactions** - Transfer operations are atomic
5. **Maintain balance integrity** - Never update balances directly, use transactions

## Future Enhancements

- Budget tracking
- Recurring transactions
- Financial reports (PDF export)
- Multi-currency support
- Transaction attachments
- Bank statement import
- Financial goals tracking

