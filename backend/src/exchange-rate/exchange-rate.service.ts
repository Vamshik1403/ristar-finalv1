import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeRateService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateExchangeRateDto) {
    return this.prisma.exchangeRate.create({
      data: dto, // matches ExchangeRateUncheckedCreateInput
    });
  }

  findAll() {
    return this.prisma.exchangeRate.findMany({
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });
  }

  async findOne(id: string) {
    const rate = await this.prisma.exchangeRate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException(`Exchange Rate with ID ${id} not found`);
    return rate;
  }

  async update(id: string, dto: UpdateExchangeRateDto) {
    const data = { ...dto };

    // Fix optional date formatting if needed
    if (data.date && !data.date.includes('T')) {
      data.date = new Date(data.date).toISOString();
    }

    return this.prisma.exchangeRate.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // throws if not found
    return this.prisma.exchangeRate.delete({ where: { id } });
  }
}
