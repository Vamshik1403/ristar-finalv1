-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "firstCroGenerationDate" TIMESTAMP(3),
ADD COLUMN     "hasCroGenerated" BOOLEAN NOT NULL DEFAULT false;
