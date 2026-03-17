-- Finance Categories table
CREATE TABLE IF NOT EXISTS finance_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('Income', 'Expense') NOT NULL,
  parent_id INT UNSIGNED NULL,
  description TEXT NULL,
  color VARCHAR(7) NULL COMMENT 'Hex color code',
  icon VARCHAR(50) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL,

  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES finance_categories(id)
    ON DELETE SET NULL,

  INDEX idx_type (type),
  INDEX idx_parent_id (parent_id),
  INDEX idx_is_active (is_active),
  UNIQUE KEY uq_category_name_type (name, type)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
