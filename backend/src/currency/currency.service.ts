import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateCurrencyDto from './dto/createcurrency.dto';
import { UpdateCurrencyDto } from './dto/updatecurrency.dto';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCurrencyDto) {
    if (!data.currencyCode || !data.currencyName || !data.currencySymbol) {
      throw new Error('Missing required currency fields');
    }
    return this.prisma.currency.create({
      data: {
        status: data.status,
        currencyCode: data.currencyCode,
        currencyName: data.currencyName,
        currencySymbol: data.currencySymbol,
      },
    });
  }

  async findAll() {
    return this.prisma.currency.findMany();
  }

  async findOne(id: number) {
    return this.prisma.currency.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateCurrencyDto) {
    return this.prisma.currency.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.currency.delete({
      where: { id },
    });
  }
}
