-- Students table (school_students)

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