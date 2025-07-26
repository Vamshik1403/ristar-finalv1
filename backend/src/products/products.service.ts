import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

 async create(data: CreateProductDto, files: Express.Multer.File[]) {
  // Step 1: Get the latest productId
  const latestProduct = await this.prisma.products.findFirst({
    orderBy: { createdAt: 'desc' }, // or productId if sortable
    where: {
      productId: { startsWith: 'RST/PRD/' },
    }
  });

  // Step 2: Extract last number and increment
  let newIdNumber = 1;
  if (latestProduct?.productId) {
    const lastId = latestProduct.productId.split('/').pop(); // '00001'
    const lastNumber = parseInt(lastId || '0', 10);
    newIdNumber = lastNumber + 1;
  }

  // Step 3: Pad number and construct new productId
  const newProductId = `RST/PRD/${String(newIdNumber).padStart(5, '0')}`;

  // Step 4: Create new product
  const createdProduct = await this.prisma.products.create({
    data: {
      status: data.status,
      productId: newProductId, // Auto-generated here
      productName: data.productName,
      tradeName: data.tradeName,
      grade: data.grade,
      productType: data.productType,
      derivative: data.derivative || '',
      cleanType: data.cleanType,
      unCode: data.unCode,
      packaging: data.packaging,
      containerCategory: data.containerCategory,
      containerType: data.containerType,
      classType: data.classType,
      shippingName: data.shippingName,
    }
  });

  // Step 5: Handle MSDS records
 if (data.msds?.length) {
  await this.prisma.productMSDS.createMany({
    data: data.msds
      .filter((msds) => msds.msdsCertificate !== undefined && msds.msdsCertificate !== null)
      .map((msds) => ({
        msdcIssueDate: new Date(msds.msdcIssueDate),
        msdsCertificate: msds.msdsCertificate,
        remark: msds.remark,
        productId: createdProduct.id
      }))
  });
}

  return createdProduct;
}


 async getNextProductId(): Promise<{ productId: string }> {
    const lastProduct = await this.prisma.products.findFirst({
      orderBy: { id: 'desc' },
      select: { productId: true },
    });

    let nextNumber = 1;
    if (lastProduct?.productId) {
      const match = lastProduct.productId.match(/RST\/PRD\/(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const padded = String(nextNumber).padStart(5, '0');
    return { productId: `RST/PRD/${padded}` };
  }
  
  findAll() {
    return this.prisma.products.findMany({ include: { productMSDS: true } });
  }

  findOne(id: number) {
    return this.prisma.products.findUnique({ where: { id }, include: { productMSDS: true } });
  }

  async update(id: number, data: UpdateProductDto, files: Express.Multer.File[]) {
  try {

    // 1. Ensure productId is unique (exclude current ID)
    if (data.productId) {
      const existingProducts = await this.prisma.products.findMany({
        where: {
          productId: data.productId,
          NOT: {
            id: id,
          },
        },
      });

      if (existingProducts.length > 0) {
        throw new Error(`Product ID "${data.productId}" is already used by another product.`);
      }
    }

    // 2. Update the main product
    const updatedProduct = await this.prisma.products.update({
      where: { id },
      data: {
        status: data.status,
        productId: data.productId,
        productName: data.productName,
        tradeName: data.tradeName,
        grade: data.grade,
        productType: data.productType,
        derivative: data.derivative || '',
        cleanType: data.cleanType,
        unCode: data.unCode,
        packaging: data.packaging,
        containerCategory: data.containerCategory,
        containerType: data.containerType,
        classType: data.classType,
        shippingName: data.shippingName,
      },
      include: {
        productMSDS: true,
      },
    });

    // 3. If MSDS data is passed, update it
    if (data.msds?.length) {
      // Delete previous MSDS records ONLY if we're replacing them with new ones
      await this.prisma.productMSDS.deleteMany({
        where: { productId: id },
      });

      // Filter valid MSDS entries with valid dates
      const validMSDS = data.msds
        .filter(msds => msds.msdcIssueDate || msds.msdsCertificate || msds.remark)
        .map(msds => ({
          msdcIssueDate: msds.msdcIssueDate ? new Date(msds.msdcIssueDate) : new Date(),
          msdsCertificate: msds.msdsCertificate || '',
          remark: msds.remark || '',
          productId: id,
        }));

      if (validMSDS.length > 0) {
        await this.prisma.productMSDS.createMany({
          data: validMSDS,
        });
      }
    }

    return this.findOne(id); // Return the updated product with its relationships
  } catch (error) {
    console.error('Update error:', error);
    throw new Error(error.message || 'Failed to update product');
  }
}

  async remove(id: number) {
    // Delete all MSDS records related to this product
    await this.prisma.productMSDS.deleteMany({
      where: { productId: id },
    });

    // Now delete the product
    return this.prisma.products.delete({
      where: { id },
    });
  }
}