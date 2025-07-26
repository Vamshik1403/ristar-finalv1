/*
  Warnings:

  - Added the required column `currencySymbol` to the `Currency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Currency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "currencySymbol" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
