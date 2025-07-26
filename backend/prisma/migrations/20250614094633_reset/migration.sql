-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "prodductId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "derivative" TEXT NOT NULL,
    "cleanType" TEXT NOT NULL,
    "unCode" TEXT NOT NULL,
    "packaging" TEXT NOT NULL,
    "shippingName" TEXT NOT NULL,
    "containerCategory" TEXT NOT NULL,
    "containerType" TEXT NOT NULL,
    "classType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMSDS" (
    "id" SERIAL NOT NULL,
    "msdcIssueDate" TIMESTAMP(3) NOT NULL,
    "msdsCertificate" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductMSDS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Products_prodductId_key" ON "Products"("prodductId");

-- AddForeignKey
ALTER TABLE "ProductMSDS" ADD CONSTRAINT "ProductMSDS_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
