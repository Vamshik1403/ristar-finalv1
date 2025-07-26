import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRateController } from './exchange-rate.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService, PrismaService],
})
export class ExchangeRateModule {}
