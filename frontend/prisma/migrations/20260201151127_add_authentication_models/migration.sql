-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `firebase_uid` VARCHAR(128) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `display_name` VARCHAR(255) NULL,
    `photo_url` VARCHAR(500) NULL,
    `phone_number` VARCHAR(50) NULL,
    `phone_verified` BOOLEAN NOT NULL DEFAULT false,
    `first_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NULL,
    `date_of_birth` DATE NULL,
    `gender` ENUM('Male', 'Female', 'Other') NULL,
    `bio` TEXT NULL,
    `timezone` VARCHAR(100) NOT NULL DEFAULT 'UTC',
    `locale` VARCHAR(20) NOT NULL DEFAULT 'en_US',
    `language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `status` ENUM('Active', 'Inactive', 'Suspended', 'Banned', 'PendingVerification') NOT NULL DEFAULT 'Active',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_suspended` BOOLEAN NOT NULL DEFAULT false,
    `suspended_until` DATETIME(3) NULL,
    `suspension_reason` TEXT NULL,
    `last_login_at` DATETIME(3) NULL,
    `last_login_ip` VARCHAR(45) NULL,
    `last_activity_at` DATETIME(3) NULL,
    `password_changed_at` DATETIME(3) NULL,
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    `two_factor_secret` VARCHAR(255) NULL,
    `tenant_id` BIGINT UNSIGNED NULL,
    `metadata` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_firebase_uid_key`(`firebase_uid`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `idx_firebase_uid`(`firebase_uid`),
    INDEX `idx_email`(`email`),
    INDEX `idx_status`(`status`),
    INDEX `idx_is_active`(`is_active`),
    INDEX `idx_tenant_id`(`tenant_id`),
    INDEX `idx_last_login_at`(`last_login_at`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    UNIQUE INDEX `roles_slug_key`(`slug`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_is_active`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(100) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `permissions_name_key`(`name`),
    UNIQUE INDEX `permissions_slug_key`(`slug`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_resource`(`resource`),
    INDEX `idx_action`(`action`),
    INDEX `idx_is_active`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` INTEGER UNSIGNED NOT NULL,
    `assigned_by` BIGINT UNSIGNED NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_role_id`(`role_id`),
    INDEX `idx_is_active`(`is_active`),
    INDEX `idx_expires_at`(`expires_at`),
    UNIQUE INDEX `user_roles_user_id_role_id_key`(`user_id`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` INTEGER UNSIGNED NOT NULL,
    `permission_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_role_id`(`role_id`),
    INDEX `idx_permission_id`(`permission_id`),
    UNIQUE INDEX `role_permissions_role_id_permission_id_key`(`role_id`, `permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `session_token` VARCHAR(255) NOT NULL,
    `refresh_token` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `device_type` VARCHAR(50) NULL,
    `device_id` VARCHAR(255) NULL,
    `location` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `expires_at` DATETIME(3) NOT NULL,
    `last_activity_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_sessions_session_token_key`(`session_token`),
    UNIQUE INDEX `user_sessions_refresh_token_key`(`refresh_token`),
    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_session_token`(`session_token`),
    INDEX `idx_refresh_token`(`refresh_token`),
    INDEX `idx_is_active`(`is_active`),
    INDEX `idx_expires_at`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,
    `revoked_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_token`(`token`),
    INDEX `idx_expires_at`(`expires_at`),
    INDEX `idx_is_revoked`(`is_revoked`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `email_notifications` BOOLEAN NOT NULL DEFAULT true,
    `push_notifications` BOOLEAN NOT NULL DEFAULT true,
    `sms_notifications` BOOLEAN NOT NULL DEFAULT false,
    `profile_visibility` ENUM('Public', 'Private', 'Friends', 'Custom') NOT NULL DEFAULT 'Public',
    `show_email` BOOLEAN NOT NULL DEFAULT false,
    `show_phone` BOOLEAN NOT NULL DEFAULT false,
    `theme` VARCHAR(20) NOT NULL DEFAULT 'light',
    `language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `timezone` VARCHAR(100) NOT NULL DEFAULT 'UTC',
    `date_format` VARCHAR(20) NOT NULL DEFAULT 'YYYY-MM-DD',
    `time_format` VARCHAR(10) NOT NULL DEFAULT '24h',
    `items_per_page` INTEGER NOT NULL DEFAULT 20,
    `auto_save` BOOLEAN NOT NULL DEFAULT true,
    `custom_settings` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `user_settings_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(100) NULL,
    `resource_id` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `metadata` TEXT NULL,
    `severity` ENUM('Info', 'Warning', 'Error', 'Critical') NOT NULL DEFAULT 'Info',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_action`(`action`),
    INDEX `idx_resource`(`resource`),
    INDEX `idx_severity`(`severity`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('Info', 'Success', 'Warning', 'Error', 'System', 'Security') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(500) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `metadata` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_type`(`type`),
    INDEX `idx_is_read`(`is_read`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
