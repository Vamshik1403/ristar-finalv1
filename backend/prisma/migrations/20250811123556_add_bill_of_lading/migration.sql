-- AlterTable
ALTER TABLE "EmptyRepoJob" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MovementHistory" ADD COLUMN     "jobNumber" TEXT,
ADD COLUMN     "vesselName" TEXT;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "tankPreparation" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "userType" TEXT NOT NULL DEFAULT 'superadmin',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillofLading" (
    "id" SERIAL NOT NULL,
    "shipperName" TEXT NOT NULL,
    "shipperAddress" TEXT,
    "shipperContactNo" TEXT,
    "shipperEmail" TEXT,
    "consigneeName" TEXT NOT NULL,
    "consigneeAddress" TEXT,
    "consigneeContactNo" TEXT,
    "consigneeEmail" TEXT,
    "notifyPartyName" TEXT NOT NULL,
    "notifyPartyAddress" TEXT,
    "notifyPartyContactNo" TEXT,
    "notifyPartyEmail" TEXT,
    "sealNo" TEXT NOT NULL,
    "grossWt" TEXT NOT NULL,
    "netWt" TEXT NOT NULL,
    "billofLadingDetails" TEXT,
    "freightPrepaid" TEXT,
    "freightPostpaid" TEXT,
    "deliveryAgentName" TEXT NOT NULL,
    "deliveryAgentAddress" TEXT,
    "Vat" TEXT,
    "deliveryAgentContactNo" TEXT,
    "deliveryAgentEmail" TEXT,
    "freightAmount" TEXT,

    CONSTRAINT "BillofLading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
