/*
  Warnings:

  - You are about to drop the column `prodductId` on the `Products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `portId` to the `AddressBook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Products_prodductId_key";

-- AlterTable
ALTER TABLE "AddressBook" ADD COLUMN     "portId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "prodductId",
ADD COLUMN     "productId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Products_productId_key" ON "Products"("productId");

-- AddForeignKey
ALTER TABLE "AddressBook" ADD CONSTRAINT "AddressBook_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Ports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
