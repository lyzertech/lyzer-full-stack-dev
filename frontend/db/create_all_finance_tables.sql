-- Create all finance_ tables in dependency order
-- Run this to create all finance schema for the application.

-- 1) Banks (no dependencies)
SOURCE create_finance_banks_table.sql;

-- 2) Accounts (depends on banks)
SOURCE create_finance_accounts_table.sql;

-- 3) Categories (self-referencing for parent categories)
SOURCE create_finance_categories_table.sql;

-- 4) Transactions (depends on accounts and categories)
SOURCE create_finance_transactions_table.sql;

