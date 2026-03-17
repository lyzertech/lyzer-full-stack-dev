-- Finance Accounts table
CREATE TABLE IF NOT EXISTS finance_accounts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  bank_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NULL,
  account_type ENUM('Checking', 'Savings', 'Credit', 'Investment', 'Cash', 'Other') NOT NULL DEFAULT 'Checking',
  currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
  initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  
  CONSTRAINT fk_accounts_bank
    FOREIGN KEY (bank_id) REFERENCES finance_banks(id) ON DELETE RESTRICT,
  
  INDEX idx_bank_id (bank_id),
  INDEX idx_account_type (account_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

