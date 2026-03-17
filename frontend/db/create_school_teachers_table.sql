-- Teachers table (school_teachers)

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