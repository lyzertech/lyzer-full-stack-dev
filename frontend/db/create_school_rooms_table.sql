-- Rooms table (school_rooms)

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