import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHandlingAgentTariffDto } from './dto/create-handling-agent-tariff.dto';
import { UpdateHandlingAgentTariffDto } from './dto/update-handling-agent-tariff.dto';

@Injectable()
export class HandlingAgentTariffCostService {
      constructor(private prisma: PrismaService) {}

      create(data: CreateHandlingAgentTariffDto) {
    return this.prisma.handlingAgentTariffCost.create({ data });
  }

  findAll() {
    return this.prisma.handlingAgentTariffCost.findMany({
      include: {
        addressBook: true,
        port: true,
        currency: true,
      },
    });
  }

findOne(id: number) {

  if (!id || isNaN(id)) {
    throw new Error(`Invalid ID: ${id}`);
  }

  return this.prisma.handlingAgentTariffCost.findUnique({
    where: { id },
    include: {
      addressBook: true,
      port: true,
      currency: true,
    },
  });
}


  update(id: number, data: UpdateHandlingAgentTariffDto) {
    return this.prisma.handlingAgentTariffCost.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.handlingAgentTariffCost.delete({ where: { id } });
  }
}
