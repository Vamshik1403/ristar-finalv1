import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepotAvgTariffDto } from './dto/create-depot-avg-tariff.dto';
import { UpdateDepotAvgTariffDto } from './dto/update-depot-avg-tariff.dto';

@Injectable()
export class DepotAvgTariffService {
    constructor(private prisma: PrismaService) {}

  create(data: CreateDepotAvgTariffDto) {
    // Convert numeric fields to string
    return this.prisma.depotAvgTariff.create({
      data: {
        ...data,
        manlidPTFE: data.manlidPTFE?.toString(),
        leakTest: data.leakTest?.toString(),
        loadOnLoadOff: data.loadOnLoadOff?.toString(),
        cleaningSurvey: data.cleaningSurvey?.toString(),
        maintenanceAndRepair: data.maintenanceAndRepair?.toString(),
        total: data.total?.toString(),
      },
    });
  }

  findAll() {
    return this.prisma.depotAvgTariff.findMany({
      include: {
        addressBook: true,
        port: true,
        currency: true,
      },
    });
  }

  findOne(id: number) {
    // Add validation to ensure id is a valid number
    if (!id || isNaN(id)) {
      throw new Error('Invalid ID provided');
    }
    
    return this.prisma.depotAvgTariff.findUnique({
      where: { id }, // This passes the id correctly
      include: {
        addressBook: true,
        port: true,
        currency: true,
      },
    });
  }

  update(id: number, data: UpdateDepotAvgTariffDto) {
    return this.prisma.depotAvgTariff.update({
      where: { id },
      data: {
        ...data,
        manlidPTFE: data.manlidPTFE?.toString(),
        leakTest: data.leakTest?.toString(),
        loadOnLoadOff: data.loadOnLoadOff?.toString(),
        cleaningSurvey: data.cleaningSurvey?.toString(),
        maintenanceAndRepair: data.maintenanceAndRepair?.toString(),
        total: data.total?.toString(),
      },
    });
  } 

  remove(id: number) {
    return this.prisma.depotAvgTariff.delete({ where: { id } });
  }
}
