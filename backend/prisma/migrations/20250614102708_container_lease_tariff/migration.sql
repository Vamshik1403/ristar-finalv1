-- CreateTable
CREATE TABLE "ContainerLeaseTariff" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "tariffCode" TEXT NOT NULL,
    "containerCategory" TEXT NOT NULL,
    "containerType" TEXT NOT NULL,
    "containerClass" TEXT NOT NULL,
    "leaseRentPerDay" TEXT NOT NULL,
    "currencyName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContainerLeaseTariff_pkey" PRIMARY KEY ("id")
);
