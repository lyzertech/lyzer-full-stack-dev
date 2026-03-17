-- CreateTable
CREATE TABLE `finance_banks` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NULL,
    `account_number` VARCHAR(100) NULL,
    `routing_number` VARCHAR(50) NULL,
    `branch` VARCHAR(255) NULL,
    `contact_person` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `contact_email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `idx_name`(`name`),
    INDEX `idx_code`(`code`),
    INDEX `idx_is_active`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_accounts` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `bank_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `account_number` VARCHAR(100) NULL,
    `account_type` ENUM('Checking', 'Savings', 'Credit', 'Investment', 'Cash', 'Other') NOT NULL DEFAULT 'Checking',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `initial_balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `current_balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `idx_bank_id`(`bank_id`),
    INDEX `idx_account_type`(`account_type`),
    INDEX `idx_is_active`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_categories` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('Income', 'Expense') NOT NULL,
    `parent_id` INTEGER UNSIGNED NULL,
    `description` TEXT NULL,
    `color` VARCHAR(7) NULL,
    `icon` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_type`(`type`),
    INDEX `idx_parent_id`(`parent_id`),
    INDEX `idx_is_active`(`is_active`),
    UNIQUE INDEX `finance_categories_name_type_key`(`name`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `transaction_type` ENUM('Income', 'Expense', 'Transfer') NOT NULL,
    `account_id` INTEGER UNSIGNED NOT NULL,
    `transfer_to_account_id` INTEGER UNSIGNED NULL,
    `category_id` INTEGER UNSIGNED NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `balance_after` DECIMAL(15, 2) NOT NULL,
    `description` TEXT NULL,
    `reference_number` VARCHAR(100) NULL,
    `transaction_date` DATE NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `idx_account_id`(`account_id`),
    INDEX `idx_transfer_to_account_id`(`transfer_to_account_id`),
    INDEX `idx_category_id`(`category_id`),
    INDEX `idx_transaction_type`(`transaction_type`),
    INDEX `idx_transaction_date`(`transaction_date`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_grades` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `level` INTEGER NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `school_grades_name_level_key`(`name`, `level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_rooms` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `grade_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `capacity` INTEGER NULL,
    `location` VARCHAR(100) NULL,
    `teacher_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `idx_rooms_grade`(`grade_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_settings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_code` VARCHAR(50) NULL,
    `school_name` VARCHAR(255) NOT NULL,
    `short_name` VARCHAR(100) NULL,
    `address_line1` VARCHAR(255) NULL,
    `address_line2` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `postal_code` VARCHAR(20) NULL,
    `country` VARCHAR(100) NULL,
    `phone` VARCHAR(50) NULL,
    `fax` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `contact_person_name` VARCHAR(255) NULL,
    `contact_person_phone` VARCHAR(50) NULL,
    `contact_person_email` VARCHAR(255) NULL,
    `logo_url` VARCHAR(255) NULL,
    `favicon_url` VARCHAR(255) NULL,
    `timezone` VARCHAR(100) NOT NULL DEFAULT 'UTC',
    `locale` VARCHAR(20) NOT NULL DEFAULT 'en_US',
    `academic_year_start` DATE NULL,
    `academic_year_end` DATE NULL,
    `default_language` VARCHAR(20) NOT NULL DEFAULT 'en',
    `default_currency` VARCHAR(10) NULL,
    `registration_number` VARCHAR(100) NULL,
    `tax_id` VARCHAR(100) NULL,
    `sms_enabled` BOOLEAN NOT NULL DEFAULT false,
    `sms_provider` VARCHAR(100) NULL,
    `extra` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `school_settings_school_code_key`(`school_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_students` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nis` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Male',
    `date_of_birth` DATE NULL,
    `grade` INTEGER UNSIGNED NULL,
    `room` INTEGER UNSIGNED NULL,
    `parent_name` VARCHAR(255) NULL,
    `parent_phone` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `qr_hash` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `school_students_nis_key`(`nis`),
    UNIQUE INDEX `school_students_qr_hash_key`(`qr_hash`),
    INDEX `idx_grade`(`grade`),
    INDEX `idx_room`(`room`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_subjects` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `grade` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `type` ENUM('mandatory', 'elective') NOT NULL DEFAULT 'mandatory',
    `hours_per_week` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `school_subjects_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school_teachers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `degree` VARCHAR(100) NULL,
    `email` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `nip` VARCHAR(100) NOT NULL,
    `gender` ENUM('Male', 'Female') NOT NULL DEFAULT 'Male',
    `status` ENUM('Active', 'OnLeave', 'Inactive') NOT NULL DEFAULT 'Active',
    `job_type` ENUM('Permanent', 'Contract') NOT NULL DEFAULT 'Permanent',
    `join_date` DATE NULL,
    `avatar` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `finance_accounts` ADD CONSTRAINT `finance_accounts_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `finance_banks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_categories` ADD CONSTRAINT `finance_categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `finance_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_transactions` ADD CONSTRAINT `finance_transactions_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `finance_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_transactions` ADD CONSTRAINT `finance_transactions_transfer_to_account_id_fkey` FOREIGN KEY (`transfer_to_account_id`) REFERENCES `finance_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_transactions` ADD CONSTRAINT `finance_transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `finance_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `school_rooms` ADD CONSTRAINT `school_rooms_grade_id_fkey` FOREIGN KEY (`grade_id`) REFERENCES `school_grades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `school_students` ADD CONSTRAINT `school_students_grade_fkey` FOREIGN KEY (`grade`) REFERENCES `school_grades`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `school_students` ADD CONSTRAINT `school_students_room_fkey` FOREIGN KEY (`room`) REFERENCES `school_rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
