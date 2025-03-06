-- AlterTable
ALTER TABLE `tour` ADD COLUMN `state` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active';
