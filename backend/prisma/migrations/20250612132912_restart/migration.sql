/*
  Warnings:

  - You are about to drop the column `regionId` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the `BusinessType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Region` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `businessType` to the `AddressBook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regions` to the `Country` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Country" DROP CONSTRAINT "Country_regionId_fkey";

-- AlterTable
ALTER TABLE "AddressBook" ADD COLUMN     "businessType" TEXT NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Country" DROP COLUMN "regionId",
ADD COLUMN     "regions" TEXT NOT NULL;

-- DropTable
DROP TABLE "BusinessType";

-- DropTable
DROP TABLE "Region";
