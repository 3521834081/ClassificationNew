/*
  Warnings:

  - You are about to alter the column `describe` on the `sensitive_level` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(255)`.
  - You are about to drop the `model` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `classification_template_id` to the `sensitive_level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `create_time` to the `sensitive_level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_time` to the `sensitive_level` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `sensitive_level` required. This step will fail if there are existing NULL values in that column.
  - Made the column `count` on table `sensitive_level` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `model` DROP FOREIGN KEY `sensitive id`;

-- AlterTable
ALTER TABLE `sensitive_level` ADD COLUMN `classification_template_id` INTEGER NOT NULL,
    ADD COLUMN `create_time` INTEGER NOT NULL,
    ADD COLUMN `type` INTEGER NULL,
    ADD COLUMN `update_time` INTEGER NOT NULL,
    MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `describe` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `model`;

-- DropTable
DROP TABLE `template`;

-- CreateTable
CREATE TABLE `classification_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` INTEGER NULL,
    `is_use` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `describe` VARCHAR(255) NOT NULL,
    `content` JSON NOT NULL,
    `create_time` INTEGER NOT NULL,
    `update_time` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recognition_model` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `classification_template_id` INTEGER NOT NULL,
    `type` INTEGER NOT NULL,
    `sensitive_level_id` INTEGER NOT NULL,
    `rule` JSON NOT NULL,
    `describe` TEXT NULL,
    `create_time` INTEGER NOT NULL,
    `update_time` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensitive_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `classification_template_id` INTEGER NOT NULL,
    `table_name` VARCHAR(255) NOT NULL,
    `database_id` INTEGER NOT NULL,
    `total_row` INTEGER NOT NULL,
    `total_column` INTEGER NOT NULL,
    `sensitive_column` INTEGER NOT NULL,
    `number_cell` INTEGER NOT NULL,
    `hit_data` JSON NULL,
    `create_time` DATETIME(0) NOT NULL,
    `update_time` DATETIME(0) NOT NULL,
    `column_info` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensitive_rules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `sensitive_level_id` INTEGER NOT NULL,
    `recognition_model_id` INTEGER NULL,
    `classification_template_id` INTEGER NOT NULL,
    `sensitive_classification_id` VARCHAR(255) NOT NULL,
    `status` INTEGER NOT NULL,
    `scan_range` JSON NULL,
    `create_time` INTEGER NULL,
    `update_time` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resources_info` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `instance` VARCHAR(40) NULL,
    `instanceAlias` VARCHAR(40) NULL,
    `region` VARCHAR(40) NULL,
    `province` VARCHAR(40) NULL,
    `authorizedDatabase` INTEGER UNSIGNED NULL,
    `describe` VARCHAR(200) NULL,
    `create_time` DATETIME(0) NULL,
    `update_time` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `self_db` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resources_info_id` INTEGER NOT NULL,
    `show_count` INTEGER NOT NULL,
    `identify_permissions` INTEGER NOT NULL,
    `db_type` VARCHAR(100) NOT NULL,
    `port` INTEGER NOT NULL,
    `user` VARCHAR(100) NOT NULL,
    `database` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `describe` VARCHAR(100) NULL,
    `create_time` DATETIME(0) NOT NULL,
    `update_time` DATETIME(0) NOT NULL,
    `scan_time` DATETIME(0) NULL,
    `scan_state` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `db_sensitive_result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `self_db_id` INTEGER NULL,
    `total_tables` INTEGER NULL,
    `sensitive_tables` INTEGER NULL,
    `create_time` DATETIME(0) NULL,
    `update_time` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modelandrules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recognition_model_id` INTEGER NULL,
    `sensitive_rules_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `column_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `column_id` INTEGER NULL,
    `hit_rule` VARCHAR(255) NULL,
    `column_name` VARCHAR(255) NULL,
    `before_hit_rule` VARCHAR(255) NULL,
    `attribute_type` VARCHAR(255) NULL,
    `rule_name` VARCHAR(255) NULL,
    `classification_name` VARCHAR(255) NULL,
    `revision_status` INTEGER NULL,
    `sensitive_level` VARCHAR(255) NULL,
    `sampling_results` VARCHAR(255) NULL,
    `sensitive_results_id` INTEGER NULL,
    `rule_id` INTEGER NULL,
    `before_hit_level` VARCHAR(255) NULL,
    `create_time` DATETIME(0) NULL,
    `update_time` DATETIME(0) NULL,
    `is_delete` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test11` (
    `update_time` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
