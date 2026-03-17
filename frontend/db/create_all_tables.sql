-- Create all school_ tables in dependency order
-- Run on an empty database (or after renaming existing tables) to create all schema for the application.

-- 1) Grades
CREATE TABLE IF NOT EXISTS school_grades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  level INT NOT NULL,
  description TEXT NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_grade_name_level (name, level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Teachers
CREATE TABLE IF NOT EXISTS school_teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  degree VARCHAR(100) NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  nip VARCHAR(100) NOT NULL,
  gender ENUM('Male','Female') DEFAULT 'Male',
  status ENUM('Active','On Leave','Inactive') DEFAULT 'Active',
  job_type ENUM('Permanent','Contract') DEFAULT 'Permanent',
  join_date DATE NULL,
  avatar VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Rooms (depends on grades)
CREATE TABLE IF NOT EXISTS school_rooms (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  grade_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  capacity INT NULL,
  location VARCHAR(100) NULL,
  teacher_id INT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,

  PRIMARY KEY (id),
  KEY idx_rooms_grade (grade_id),
  CONSTRAINT fk_rooms_grade FOREIGN KEY (grade_id) REFERENCES school_grades(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Students (depends on grades and rooms)
CREATE TABLE IF NOT EXISTS school_students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nis VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  gender ENUM('Male','Female','Other') DEFAULT 'Male',
  date_of_birth DATE DEFAULT NULL,
  grade INT UNSIGNED NULL,
  room INT UNSIGNED NULL,
  parent_name VARCHAR(255) DEFAULT NULL,
  parent_phone VARCHAR(50) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  qr_hash VARCHAR(128) DEFAULT NULL UNIQUE,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,

  CONSTRAINT fk_students_grade
    FOREIGN KEY (grade) REFERENCES school_grades(id) ON DELETE SET NULL,
  CONSTRAINT fk_students_room
    FOREIGN KEY (room) REFERENCES school_rooms(id) ON DELETE SET NULL,

  INDEX idx_grade (grade),
  INDEX idx_room (room)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) Subjects (grade currently numeric; migration exists to add grade_id FK)
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

-- 6) School settings
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
