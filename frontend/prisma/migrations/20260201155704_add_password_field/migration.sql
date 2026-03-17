-- AlterTable
ALTER TABLE `auth_users` ADD COLUMN `password` VARCHAR(255) NULL,
    MODIFY `firebase_uid` VARCHAR(128) NULL;
