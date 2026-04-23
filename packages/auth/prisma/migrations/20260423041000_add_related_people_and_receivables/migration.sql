CREATE TABLE `related_person` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `related_person_userId_name_idx`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `debt`
    ADD COLUMN `personId` VARCHAR(191) NULL,
    ADD COLUMN `direction` ENUM('PAYABLE', 'RECEIVABLE') NOT NULL DEFAULT 'PAYABLE';

CREATE INDEX `debt_userId_direction_idx` ON `debt`(`userId`, `direction`);
CREATE INDEX `debt_personId_idx` ON `debt`(`personId`);

ALTER TABLE `related_person` ADD CONSTRAINT `related_person_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `debt` ADD CONSTRAINT `debt_personId_fkey`
    FOREIGN KEY (`personId`) REFERENCES `related_person`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
