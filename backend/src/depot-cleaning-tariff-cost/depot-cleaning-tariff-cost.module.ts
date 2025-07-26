import { Module } from '@nestjs/common';
import { DepotCleaningTariffCostController } from './depot-cleaning-tariff-cost.controller';
import { DepotCleaningTariffCostService } from './depot-cleaning-tariff-cost.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Import any necessary modules here, e.g., PrismaModule if needed
  controllers: [DepotCleaningTariffCostController],
  providers: [DepotCleaningTariffCostService]
})
export class DepotCleaningTariffCostModule {}
