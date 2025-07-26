import { Module } from '@nestjs/common';
import { LeasingInfoController } from './leasing-info.controller';
import { LeasingInfoService } from './leasing-info.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [LeasingInfoController],
  providers: [LeasingInfoService, PrismaService]
})
export class LeasingInfoModule {}
