import { Module } from '@nestjs/common';
import { DepotAvgTariffController } from './depot-avg-tariff.controller';
import { DepotAvgTariffService } from './depot-avg-tariff.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Assuming PrismaModule is imported here
  controllers: [DepotAvgTariffController],
  providers: [DepotAvgTariffService]
})
export class DepotAvgTariffModule {}
