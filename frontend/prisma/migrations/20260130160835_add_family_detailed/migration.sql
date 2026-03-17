-- AlterTable
ALTER TABLE `family` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
