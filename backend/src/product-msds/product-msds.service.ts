import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductMSDSDto } from './dto/create-product-msds.dto';
import { UpdateProductMSDSDto } from './dto/update-product-msds.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';

@Injectable()
export class ProductMsdsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProductMSDSDto) {
    return this.prisma.productMSDS.create({
      data: {
        msdcIssueDate: new Date(data.msdcIssueDate),
        msdsCertificate: data.msdsCertificate,
        remark: data.remark,
        product: {
          connect: {
            id: data.productId
          }
        }
      }
    });
  }

  findAll() {
    return this.prisma.productMSDS.findMany({ include: { product: true } });
  }

  findOne(id: number) {
    return this.prisma.productMSDS.findUnique({ where: { id }, include: { product: true } });
  }

 update(id: number, data: UpdateProductDto) {
  return this.prisma.products.update({
    where: { id },
    data,
  });
}

  remove(id: number) {
    return this.prisma.productMSDS.delete({ where: { id } });
  }
}
