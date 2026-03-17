-- School settings table
-- Stores general school configuration (singleton-style, one row per school)

CREATE TABLE IF NOT EXISTS school_settings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  school_code VARCHAR(50) NULL UNIQUE,
  school_name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NULL,

  address_line1 VARCHAR(255) NULL,
  address_line2 VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  postal_code VARCHAR(20) NULL,
  country VARCHAR(100) NULL,

  phone VARCHAR(50) NULL,
  fax VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  website VARCHAR(255) NULL,

  contact_person_name VARCHAR(255) NULL,
  contact_person_phone VARCHAR(50) NULL,
  contact_person_email VARCHAR(255) NULL,

  logo_url VARCHAR(255) NULL,
  favicon_url VARCHAR(255) NULL,

  timezone VARCHAR(100) NULL DEFAULT 'UTC',
  locale VARCHAR(20) NULL DEFAULT 'en_US',

  academic_year_start DATE NULL,
  academic_year_end DATE NULL,
  default_language VARCHAR(20) NULL DEFAULT 'en',
  default_currency VARCHAR(10) NULL,

  registration_number VARCHAR(100) NULL,
  tax_id VARCHAR(100) NULL,

  sms_enabled TINYINT(1) NOT NULL DEFAULT 0,
  sms_provider VARCHAR(100) NULL,

  extra TEXT NULL,

  is_active TINYINT(1) NOT NULL DEFAULT 1,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;