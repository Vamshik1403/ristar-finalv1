import { Module } from '@nestjs/common';
import { ContainerLeaseTariffController } from './container-lease-tariff.controller';
import { ContainerLeaseTariffService } from './container-lease-tariff.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContainerLeaseTariffController],
  providers: [ContainerLeaseTariffService]
})
export class ContainerLeaseTariffModule {}
