-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "containerNumber" TEXT NOT NULL,
    "containerCategory" TEXT NOT NULL,
    "containerType" TEXT NOT NULL,
    "containerSize" TEXT NOT NULL,
    "containerClass" TEXT NOT NULL,
    "containerCapacity" TEXT NOT NULL,
    "capacityUnit" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "buildYear" TEXT NOT NULL,
    "grossWeight" TEXT NOT NULL,
    "tareWeight" TEXT NOT NULL,
    "InitialSurveyDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeasingInfo" (
    "id" SERIAL NOT NULL,
    "ownershipType" TEXT NOT NULL,
    "leasingRefNo" TEXT NOT NULL,
    "leasoraddressbookId" INTEGER NOT NULL,
    "onHireDate" TIMESTAMP(3) NOT NULL,
    "portId" INTEGER NOT NULL,
    "onHireDepotaddressbookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inventoryId" INTEGER NOT NULL,

    CONSTRAINT "LeasingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodicTankCertificates" (
    "id" SERIAL NOT NULL,
    "inspectionDate" TIMESTAMP(3),
    "inspectionType" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "certicateFile" TEXT,
    "inventoryId" INTEGER NOT NULL,

    CONSTRAINT "PeriodicTankCertificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnHireReport" (
    "id" SERIAL NOT NULL,
    "reportDate" TIMESTAMP(3),
    "reportDocument" TEXT,
    "inventoryId" INTEGER NOT NULL,

    CONSTRAINT "OnHireReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeasingInfo" ADD CONSTRAINT "LeasingInfo_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeasingInfo" ADD CONSTRAINT "LeasingInfo_leasoraddressbookId_fkey" FOREIGN KEY ("leasoraddressbookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeasingInfo" ADD CONSTRAINT "LeasingInfo_onHireDepotaddressbookId_fkey" FOREIGN KEY ("onHireDepotaddressbookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeasingInfo" ADD CONSTRAINT "LeasingInfo_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodicTankCertificates" ADD CONSTRAINT "PeriodicTankCertificates_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnHireReport" ADD CONSTRAINT "OnHireReport_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
