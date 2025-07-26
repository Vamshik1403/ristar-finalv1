import { Module } from '@nestjs/common';
import { HandlingAgentTariffCostController } from './handling-agent-tariff-cost.controller';
import { HandlingAgentTariffCostService } from './handling-agent-tariff-cost.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HandlingAgentTariffCostController],
  providers: [HandlingAgentTariffCostService]
})
export class HandlingAgentTariffCostModule {}
