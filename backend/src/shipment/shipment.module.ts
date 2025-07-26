import { Module } from '@nestjs/common';
import { ShipmentController } from './shipment.controller';
import { ShipmentService } from './shipment.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports :[PrismaModule],
  controllers: [ShipmentController],
  providers: [ShipmentService]
})
export class ShipmentModule {}
