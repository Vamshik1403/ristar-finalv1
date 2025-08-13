/*
  Warnings:

  - You are about to drop the column `shipperAddress` on the `BillofLading` table. All the data in the column will be lost.
  - You are about to drop the column `shipperContactNo` on the `BillofLading` table. All the data in the column will be lost.
  - You are about to drop the column `shipperEmail` on the `BillofLading` table. All the data in the column will be lost.
  - You are about to drop the column `shipperName` on the `BillofLading` table. All the data in the column will be lost.
  - Added the required column `shippersName` to the `BillofLading` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BillofLading" DROP COLUMN "shipperAddress",
DROP COLUMN "shipperContactNo",
DROP COLUMN "shipperEmail",
DROP COLUMN "shipperName",
ADD COLUMN     "shippersAddress" TEXT,
ADD COLUMN     "shippersContactNo" TEXT,
ADD COLUMN     "shippersEmail" TEXT,
ADD COLUMN     "shippersName" TEXT NOT NULL;
