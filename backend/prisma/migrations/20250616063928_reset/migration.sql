/*
  Warnings:

  - You are about to drop the column `portId` on the `AddressBook` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddressBook" DROP CONSTRAINT "AddressBook_portId_fkey";

-- AlterTable
ALTER TABLE "AddressBook" DROP COLUMN "portId";
