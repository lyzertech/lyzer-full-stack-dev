-- Subjects table (school_subjects)
-- Created from provided DDL

CREATE TABLE IF NOT EXISTS school_subjects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,

  grade TINYINT NOT NULL COMMENT '10, 11, or 12',
  semester TINYINT NOT NULL COMMENT '1 or 2',

  type ENUM('mandatory', 'elective') NOT NULL DEFAULT 'mandatory',
  hours_per_week TINYINT NOT NULL DEFAULT 0,

  is_active TINYINT(1) NOT NULL DEFAULT 1,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;