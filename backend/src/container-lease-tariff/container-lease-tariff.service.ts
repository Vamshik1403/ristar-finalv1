import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateContainerLeaseTariffDto } from './dto/create-container-lease-tariff.dto';
import { UpdateContainerLeaseTariffDto } from './dto/update-container-lease-tariff.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContainerLeaseTariffService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateContainerLeaseTariffDto) {
    try {
      return await this.prisma.containerLeaseTariff.create({
        data: {
          tariffCode: data.tariffCode,
          containerCategory: data.containerCategory,
          containerType: data.containerType,
          containerClass: data.containerClass,
          leaseRentPerDay: data.leaseRentPerDay.toString(),
          status: data.status.toString(),
          currencyName: data.currencyName,
        },
      });
    } catch (error) {
      console.error("🔥 Prisma create error:", error);
      throw new InternalServerErrorException(error.message);
    }
  }

  findAll() {
    return this.prisma.containerLeaseTariff.findMany();
  }

  findOne(id: number) {
    return this.prisma.containerLeaseTariff.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateContainerLeaseTariffDto) {
    try {
      return await this.prisma.containerLeaseTariff.update({
        where: { id },
        data: {
          tariffCode: data.tariffCode,
          containerCategory: data.containerCategory,
          containerType: data.containerType,
          containerClass: data.containerClass,
          leaseRentPerDay: data.leaseRentPerDay?.toString(),
          currencyName: data.currencyName,
          status: data.status !== undefined ? data.status.toString() : undefined
        },
      });
    } catch (error) {
      console.error('Prisma update error:', error);
      throw error;
    }
  }

  remove(id: number) {
    return this.prisma.containerLeaseTariff.delete({ where: { id } });
  }
}
