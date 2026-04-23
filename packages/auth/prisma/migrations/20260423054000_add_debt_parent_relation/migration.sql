ALTER TABLE `debt`
    ADD COLUMN `parentDebtId` VARCHAR(191) NULL;

CREATE INDEX `debt_parentDebtId_idx` ON `debt`(`parentDebtId`);

ALTER TABLE `debt` ADD CONSTRAINT `debt_parentDebtId_fkey`
    FOREIGN KEY (`parentDebtId`) REFERENCES `debt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
