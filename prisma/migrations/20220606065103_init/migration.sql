-- CreateTable
CREATE TABLE `model` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `type` INTEGER NULL,
    `sensitive_level_id` INTEGER NULL,
    `rule` JSON NULL,
    `describe` TEXT NULL,

    INDEX `sensitive id`(`sensitive_level_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensitive_level` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `color` VARCHAR(255) NULL,
    `count` INTEGER NULL,
    `describe` VARCHAR(500) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `int` VARCHAR(255) NULL,
    `content` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `model` ADD CONSTRAINT `sensitive id` FOREIGN KEY (`sensitive_level_id`) REFERENCES `sensitive_level`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
