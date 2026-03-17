-- CreateTable
CREATE TABLE `explore_users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `display_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `avatar` VARCHAR(500) NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT false,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `followers_count` INTEGER NOT NULL DEFAULT 0,
    `following_count` INTEGER NOT NULL DEFAULT 0,
    `posts_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `explore_users_username_key`(`username`),
    UNIQUE INDEX `explore_users_email_key`(`email`),
    INDEX `idx_username`(`username`),
    INDEX `idx_email`(`email`),
    INDEX `idx_is_active`(`is_active`),
    INDEX `idx_is_private`(`is_private`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `explore_posts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `media_url` VARCHAR(500) NULL,
    `reply_to_id` BIGINT UNSIGNED NULL,
    `repost_of_id` BIGINT UNSIGNED NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `is_private` BOOLEAN NOT NULL DEFAULT false,
    `likes_count` INTEGER NOT NULL DEFAULT 0,
    `replies_count` INTEGER NOT NULL DEFAULT 0,
    `reposts_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_reply_to_id`(`reply_to_id`),
    INDEX `idx_repost_of_id`(`repost_of_id`),
    INDEX `idx_is_deleted`(`is_deleted`),
    INDEX `idx_is_private`(`is_private`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `explore_follows` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `follower_id` BIGINT UNSIGNED NOT NULL,
    `following_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_follower_id`(`follower_id`),
    INDEX `idx_following_id`(`following_id`),
    INDEX `idx_created_at`(`created_at`),
    UNIQUE INDEX `explore_follows_follower_id_following_id_key`(`follower_id`, `following_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `explore_likes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_post_id`(`post_id`),
    INDEX `idx_created_at`(`created_at`),
    UNIQUE INDEX `explore_likes_user_id_post_id_key`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `explore_posts` ADD CONSTRAINT `explore_posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `explore_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `explore_posts` ADD CONSTRAINT `explore_posts_reply_to_id_fkey` FOREIGN KEY (`reply_to_id`) REFERENCES `explore_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `explore_posts` ADD CONSTRAINT `explore_posts_repost_of_id_fkey` FOREIGN KEY (`repost_of_id`) REFERENCES `explore_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `explore_follows` ADD CONSTRAINT `explore_follows_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `explore_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `explore_follows` ADD CONSTRAINT `explore_follows_following_id_fkey` FOREIGN KEY (`following_id`) REFERENCES `explore_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `explore_likes` ADD CONSTRAINT `explore_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `explore_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `explore_likes` ADD CONSTRAINT `explore_likes_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `explore_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
