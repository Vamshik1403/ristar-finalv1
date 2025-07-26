import { Module } from '@nestjs/common';
import { LandTransportTariffController } from './land-transport-tariff.controller';
import { LandTransportTariffService } from './land-transport-tariff.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LandTransportTariffController],
  providers: [LandTransportTariffService]
})
export class LandTransportTariffModule {}
