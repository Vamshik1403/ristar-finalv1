import { Module } from '@nestjs/common';
import { PortsController } from './ports.controller';
import { PortsService } from './ports.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PortsController],
  providers: [PortsService]
})
export class PortsModule {}
