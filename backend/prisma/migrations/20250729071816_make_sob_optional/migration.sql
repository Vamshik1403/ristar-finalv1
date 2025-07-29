/*
  Warnings:

  - You are about to drop the column `certicateFile` on the `PeriodicTankCertificates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyName]` on the table `AddressBook` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[containerNumber]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[portName]` on the table `Ports` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `BankDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaseRentPerDay` to the `LeasingInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remarks` to the `LeasingInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AddressBook" ALTER COLUMN "remark" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BankDetails" ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LeasingInfo" ADD COLUMN     "leaseRentPerDay" TEXT NOT NULL,
ADD COLUMN     "offHireDate" TIMESTAMP(3),
ADD COLUMN     "remarks" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PeriodicTankCertificates" DROP COLUMN "certicateFile",
ADD COLUMN     "certificate" TEXT;

-- CreateTable
CREATE TABLE "HandlingAgentTariffCost" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "tariffCode" TEXT NOT NULL,
    "addressBookId" INTEGER NOT NULL,
    "portId" INTEGER NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "impCommission" TEXT NOT NULL,
    "expCommission" TEXT NOT NULL,
    "transhipmentCommission" TEXT NOT NULL,
    "emptyRepoCommission" TEXT NOT NULL,
    "detentionCommission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HandlingAgentTariffCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandTransportTariff" (
    "id" SERIAL NOT NULL,
    "landTransportTariffCode" TEXT NOT NULL,
    "addressBookId" INTEGER NOT NULL,
    "transportType" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandTransportTariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepotAvgTariff" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "tariffCode" TEXT NOT NULL,
    "addressBookId" INTEGER NOT NULL,
    "portId" INTEGER NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "manlidPTFE" TEXT NOT NULL,
    "leakTest" TEXT NOT NULL,
    "loadOnLoadOff" TEXT NOT NULL,
    "cleaningSurvey" TEXT NOT NULL,
    "maintenanceAndRepair" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepotAvgTariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepotCleaningTariffCost" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "tariffCode" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "addressBookId" INTEGER NOT NULL,
    "portId" INTEGER NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "cleaningCharges" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepotCleaningTariffCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "quotationRefNumber" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "validTillDate" TIMESTAMP(3) NOT NULL,
    "shippingTerm" TEXT NOT NULL,
    "custAddressBookId" INTEGER NOT NULL,
    "billingParty" TEXT NOT NULL,
    "rateType" TEXT NOT NULL,
    "billingType" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "polPortId" INTEGER NOT NULL,
    "podPortId" INTEGER NOT NULL,
    "polFreeDays" TEXT NOT NULL,
    "podFreeDays" TEXT NOT NULL,
    "polDetentionRate" TEXT NOT NULL,
    "podDetentionRate" TEXT NOT NULL,
    "expDepotAddressBookId" INTEGER NOT NULL,
    "emptyReturnAddressBookId" INTEGER,
    "expHandlingAgentAddressBookId" INTEGER NOT NULL,
    "impHandlingAgentAddressBookId" INTEGER NOT NULL,
    "transitDays" TEXT NOT NULL,
    "transhipmentPortId" INTEGER,
    "transhipmentHandlingAgentAddressBookId" INTEGER,
    "slotRate" TEXT NOT NULL,
    "depotAvgCost" TEXT NOT NULL,
    "leasingCost" TEXT NOT NULL,
    "depotCleaningCost" TEXT NOT NULL,
    "terminalHandlingFee" TEXT NOT NULL,
    "containerPreparationCost" TEXT NOT NULL,
    "expAgencyCommission" TEXT NOT NULL,
    "impAgencyCommission" TEXT NOT NULL,
    "expCollectionCharges" TEXT NOT NULL,
    "impCollectionCharges" TEXT NOT NULL,
    "totalCost" TEXT NOT NULL,
    "sellingAmount" TEXT NOT NULL,
    "totalRevenueAmount" TEXT NOT NULL,
    "totalPLAmount" TEXT NOT NULL,
    "plMargin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "quotationRefNumber" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "refNumber" TEXT NOT NULL,
    "houseBL" TEXT NOT NULL,
    "masterBL" TEXT NOT NULL,
    "shippingTerm" TEXT NOT NULL,
    "custAddressBookId" INTEGER,
    "consigneeAddressBookId" INTEGER,
    "shipperAddressBookId" INTEGER,
    "expHandlingAgentAddressBookId" INTEGER,
    "impHandlingAgentAddressBookId" INTEGER,
    "carrierAddressBookId" INTEGER,
    "emptyReturnDepotAddressBookId" INTEGER,
    "productId" INTEGER,
    "polPortId" INTEGER,
    "podPortId" INTEGER,
    "transhipmentPortId" INTEGER,
    "polFreeDays" TEXT NOT NULL,
    "podFreeDays" TEXT NOT NULL,
    "polDetentionRate" TEXT NOT NULL,
    "podDetentionRate" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "vesselName" TEXT NOT NULL,
    "gsDate" TIMESTAMP(3) NOT NULL,
    "sob" TIMESTAMP(3),
    "etaTopod" TIMESTAMP(3) NOT NULL,
    "estimateDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentContainer" (
    "id" SERIAL NOT NULL,
    "shipmentId" INTEGER NOT NULL,
    "containerNumber" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "tare" TEXT NOT NULL,
    "inventoryId" INTEGER,
    "portId" INTEGER,
    "depotName" TEXT,

    CONSTRAINT "ShipmentContainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmptyRepoJob" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "houseBL" TEXT NOT NULL,
    "shippingTerm" TEXT NOT NULL,
    "expHandlingAgentAddressBookId" INTEGER,
    "impHandlingAgentAddressBookId" INTEGER,
    "carrierAddressBookId" INTEGER,
    "emptyReturnDepotAddressBookId" INTEGER,
    "polPortId" INTEGER,
    "podPortId" INTEGER,
    "transhipmentPortId" INTEGER,
    "polFreeDays" TEXT NOT NULL,
    "podFreeDays" TEXT NOT NULL,
    "polDetentionRate" TEXT NOT NULL,
    "podDetentionRate" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "vesselName" TEXT NOT NULL,
    "gsDate" TIMESTAMP(3) NOT NULL,
    "sob" TIMESTAMP(3),
    "etaTopod" TIMESTAMP(3) NOT NULL,
    "estimateDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmptyRepoJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepoShipmentContainer" (
    "id" SERIAL NOT NULL,
    "shipmentId" INTEGER NOT NULL,
    "containerNumber" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "tare" TEXT NOT NULL,
    "inventoryId" INTEGER,
    "portId" INTEGER,
    "depotName" TEXT,

    CONSTRAINT "RepoShipmentContainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementHistory" (
    "id" SERIAL NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "portId" INTEGER NOT NULL,
    "addressBookId" INTEGER,
    "shipmentId" INTEGER,
    "emptyRepoJobId" INTEGER,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "MovementHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotationRefNumber_key" ON "Quotation"("quotationRefNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AddressBook_companyName_key" ON "AddressBook"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_containerNumber_key" ON "Inventory"("containerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ports_portName_key" ON "Ports"("portName");

-- AddForeignKey
ALTER TABLE "HandlingAgentTariffCost" ADD CONSTRAINT "HandlingAgentTariffCost_addressBookId_fkey" FOREIGN KEY ("addressBookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandlingAgentTariffCost" ADD CONSTRAINT "HandlingAgentTariffCost_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandlingAgentTariffCost" ADD CONSTRAINT "HandlingAgentTariffCost_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandTransportTariff" ADD CONSTRAINT "LandTransportTariff_addressBookId_fkey" FOREIGN KEY ("addressBookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandTransportTariff" ADD CONSTRAINT "LandTransportTariff_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotAvgTariff" ADD CONSTRAINT "DepotAvgTariff_addressBookId_fkey" FOREIGN KEY ("addressBookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotAvgTariff" ADD CONSTRAINT "DepotAvgTariff_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotAvgTariff" ADD CONSTRAINT "DepotAvgTariff_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotCleaningTariffCost" ADD CONSTRAINT "DepotCleaningTariffCost_addressBookId_fkey" FOREIGN KEY ("addressBookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotCleaningTariffCost" ADD CONSTRAINT "DepotCleaningTariffCost_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotCleaningTariffCost" ADD CONSTRAINT "DepotCleaningTariffCost_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotCleaningTariffCost" ADD CONSTRAINT "DepotCleaningTariffCost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_custAddressBookId_fkey" FOREIGN KEY ("custAddressBookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_emptyReturnAddressBookId_fkey" FOREIGN KEY ("emptyReturnAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_expDepotAddressBookId_fkey" FOREIGN KEY ("expDepotAddressBookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_expHandlingAgentAddressBookId_fkey" FOREIGN KEY ("expHandlingAgentAddressBookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_impHandlingAgentAddressBookId_fkey" FOREIGN KEY ("impHandlingAgentAddressBookId") REFERENCES "AddressBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_podPortId_fkey" FOREIGN KEY ("podPortId") REFERENCES "Ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_polPortId_fkey" FOREIGN KEY ("polPortId") REFERENCES "Ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_transhipmentHandlingAgentAddressBookId_fkey" FOREIGN KEY ("transhipmentHandlingAgentAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_transhipmentPortId_fkey" FOREIGN KEY ("transhipmentPortId") REFERENCES "Ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_carrierAddressBookId_fkey" FOREIGN KEY ("carrierAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_consigneeAddressBookId_fkey" FOREIGN KEY ("consigneeAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_custAddressBookId_fkey" FOREIGN KEY ("custAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_emptyReturnDepotAddressBookId_fkey" FOREIGN KEY ("emptyReturnDepotAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_expHandlingAgentAddressBookId_fkey" FOREIGN KEY ("expHandlingAgentAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_impHandlingAgentAddressBookId_fkey" FOREIGN KEY ("impHandlingAgentAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_podPortId_fkey" FOREIGN KEY ("podPortId") REFERENCES "Ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_polPortId_fkey" FOREIGN KEY ("polPortId") REFERENCES "Ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_shipperAddressBookId_fkey" FOREIGN KEY ("shipperAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_transhipmentPortId_fkey" FOREIGN KEY ("transhipmentPortId") REFERENCES "Ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentContainer" ADD CONSTRAINT "ShipmentContainer_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmptyRepoJob" ADD CONSTRAINT "EmptyRepoJob_carrierAddressBookId_fkey" FOREIGN KEY ("carrierAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmptyRepoJob" ADD CONSTRAINT "EmptyRepoJob_emptyReturnDepotAddressBookId_fkey" FOREIGN KEY ("emptyReturnDepotAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmptyRepoJob" ADD CONSTRAINT "EmptyRepoJob_expHandlingAgentAddressBookId_fkey" FOREIGN KEY ("expHandlingAgentAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmptyRepoJob" ADD CONSTRAINT "EmptyRepoJob_impHandlingAgentAddressBookId_fkey" FOREIGN KEY ("impHandlingAgentAddressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmptyRepoJob" ADD CONSTRAINT "EmptyRepoJob_podPortId_fkey" FOREIGN KEY ("podPortId") REFERENCES "Ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmptyRepoJob" ADD CONSTRAINT "EmptyRepoJob_polPortId_fkey" FOREIGN KEY ("polPortId") REFERENCES "Ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmptyRepoJob" ADD CONSTRAINT "EmptyRepoJob_transhipmentPortId_fkey" FOREIGN KEY ("transhipmentPortId") REFERENCES "Ports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoShipmentContainer" ADD CONSTRAINT "RepoShipmentContainer_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "EmptyRepoJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementHistory" ADD CONSTRAINT "MovementHistory_addressBookId_fkey" FOREIGN KEY ("addressBookId") REFERENCES "AddressBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementHistory" ADD CONSTRAINT "MovementHistory_emptyRepoJobId_fkey" FOREIGN KEY ("emptyRepoJobId") REFERENCES "EmptyRepoJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementHistory" ADD CONSTRAINT "MovementHistory_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementHistory" ADD CONSTRAINT "MovementHistory_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementHistory" ADD CONSTRAINT "MovementHistory_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
