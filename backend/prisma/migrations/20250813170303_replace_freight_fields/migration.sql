/*
  Warnings:

  - You are about to drop the column `freightPostpaid` on the `BillofLading` table. All the data in the column will be lost.
  - You are about to drop the column `freightPrepaid` on the `BillofLading` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BillofLading" DROP COLUMN "freightPostpaid",
DROP COLUMN "freightPrepaid",
ADD COLUMN     "freightPayableAt" TEXT;
