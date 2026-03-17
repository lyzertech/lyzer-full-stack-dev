-- Finance Transactions table (Ledger-based)
CREATE TABLE IF NOT EXISTS finance_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  transaction_type ENUM('Income', 'Expense', 'Transfer') NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  transfer_to_account_id INT UNSIGNED NULL COMMENT 'Only for Transfer type',
  category_id INT UNSIGNED NULL COMMENT 'Only for Income/Expense types',
  amount DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL COMMENT 'Account balance after this transaction',
  description TEXT NULL,
  reference_number VARCHAR(100) NULL,
  transaction_date DATE NOT NULL,
  notes TEXT NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  
  CONSTRAINT fk_transactions_account
    FOREIGN KEY (account_id) REFERENCES finance_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_transfer_to
    FOREIGN KEY (transfer_to_account_id) REFERENCES finance_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_category
    FOREIGN KEY (category_id) REFERENCES finance_categories(id) ON DELETE SET NULL,
  
  INDEX idx_account_id (account_id),
  INDEX idx_transfer_to_account_id (transfer_to_account_id),
  INDEX idx_category_id (category_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

