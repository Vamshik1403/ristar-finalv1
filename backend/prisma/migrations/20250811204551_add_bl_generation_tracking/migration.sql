-- AlterTable
ALTER TABLE "BillofLading" ADD COLUMN     "firstGenerationDate" TIMESTAMP(3),
ADD COLUMN     "hasDraftBlGenerated" BOOLEAN NOT NULL DEFAULT false;
