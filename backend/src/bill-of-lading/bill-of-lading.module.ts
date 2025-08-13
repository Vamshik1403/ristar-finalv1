import { Module } from '@nestjs/common';
import { BillOfLadingService } from './bill-of-lading.service';
import { BillOfLadingController } from './bill-of-lading.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BillOfLadingController],
  providers: [BillOfLadingService],
  exports: [BillOfLadingService],
})
export class BillOfLadingModule {}
