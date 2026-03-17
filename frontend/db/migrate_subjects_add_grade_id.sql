-- Migration: Add grade_id FK to subjects and migrate existing grade values
-- 1) Add nullable grade_id column
ALTER TABLE school_subjects
  ADD COLUMN grade_id BIGINT UNSIGNED NULL DEFAULT NULL;

-- 2) Populate grade_id by joining on school_grades.level -> match subjects.grade (10/11/12) to grades.level
--    Note: This assumes there is one grades row per level (or the intended mapping).
UPDATE school_subjects s
JOIN school_grades g ON g.level = s.grade
SET s.grade_id = g.id;

-- 3) (Optional) Verify mapping before removing old column
-- SELECT s.id, s.code, s.grade, s.grade_id, g.level, g.name FROM school_subjects s LEFT JOIN school_grades g ON g.id = s.grade_id;

-- 4) If mapping is complete and you want to remove the legacy numeric column:
ALTER TABLE school_subjects
  DROP COLUMN grade;

-- 5) Make grade_id NOT NULL if you require it for all subjects
-- ALTER TABLE school_subjects MODIFY grade_id BIGINT UNSIGNED NOT NULL;

-- 6) Add foreign key constraint (choose ON DELETE SET NULL or RESTRICT depending on desired behavior)
ALTER TABLE school_subjects
  ADD CONSTRAINT fk_subjects_grades FOREIGN KEY (grade_id) REFERENCES school_grades(id)
  ON UPDATE CASCADE
  ON DELETE SET NULL; -- use RESTRICT if you want to prevent deleting grades with subjects

-- IMPORTANT: Run this migration in a safe environment and backup DB before applying.
-- If your mapping is more complex (multiple grades with same level), adjust the JOIN accordingly.