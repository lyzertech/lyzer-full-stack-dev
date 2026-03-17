/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `explore_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `explore_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `explore_users` ADD COLUMN `user_id` BIGINT UNSIGNED NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `explore_users_user_id_key` ON `explore_users`(`user_id`);

-- CreateIndex
CREATE INDEX `idx_user_id` ON `explore_users`(`user_id`);

-- AddForeignKey
ALTER TABLE `explore_users` ADD CONSTRAINT `explore_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
