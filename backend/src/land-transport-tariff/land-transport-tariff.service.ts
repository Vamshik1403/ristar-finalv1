import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLandTransportTariffDto } from './dto/create-land-transport-tariff.dto';
import { UpdateLandTransportTariffDto } from './dto/update-land-transport-tariff.dto';

@Injectable()
export class LandTransportTariffService {
      constructor(private prisma: PrismaService) {}

  create(data: CreateLandTransportTariffDto) {
    return this.prisma.landTransportTariff.create({ data });
  }

  findAll() {
    return this.prisma.landTransportTariff.findMany({
      include: {
        addressBook: true,
        currency: true,
      },
    });
  }

findOne(id: number) {
  return this.prisma.landTransportTariff.findUnique({
    where: {
      id, // ❌ This is `undefined` or `NaN`
    },
    include: {
      addressBook: true,
      currency: true,
    },
  });
}


  update(id: number, data: UpdateLandTransportTariffDto) {
    return this.prisma.landTransportTariff.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.landTransportTariff.delete({ where: { id } });
  }
}
