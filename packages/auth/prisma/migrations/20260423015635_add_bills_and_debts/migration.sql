-- CreateTable
CREATE TABLE `bill` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'REVIEWED', 'CONFIRMED', 'DISCARDED') NOT NULL DEFAULT 'DRAFT',
    `rawText` LONGTEXT NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `issuedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `bill_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bill_item` (
    `id` VARCHAR(191) NOT NULL,
    `billId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `type` ENUM('FIXED', 'VARIABLE') NOT NULL DEFAULT 'VARIABLE',
    `recurrence` ENUM('NONE', 'MONTHLY', 'WEEKLY', 'YEARLY') NOT NULL DEFAULT 'NONE',
    `selected` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `bill_item_billId_idx`(`billId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debt` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `billId` VARCHAR(191) NULL,
    `billItemId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `type` ENUM('FIXED', 'VARIABLE') NOT NULL DEFAULT 'VARIABLE',
    `recurrence` ENUM('NONE', 'MONTHLY', 'WEEKLY', 'YEARLY') NOT NULL DEFAULT 'NONE',
    `status` ENUM('OPEN', 'PAID', 'OVERDUE', 'CANCELED') NOT NULL DEFAULT 'OPEN',
    `source` ENUM('BILL', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
    `dueDate` DATETIME(3) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `debt_billItemId_key`(`billItemId`),
    INDEX `debt_userId_dueDate_idx`(`userId`, `dueDate`),
    INDEX `debt_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bill_item` ADD CONSTRAINT `bill_item_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `bill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debt` ADD CONSTRAINT `debt_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `bill`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debt` ADD CONSTRAINT `debt_billItemId_fkey` FOREIGN KEY (`billItemId`) REFERENCES `bill_item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
