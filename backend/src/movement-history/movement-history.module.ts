import { Module } from '@nestjs/common';
import { MovementHistoryController } from './movement-history.controller';
import { MovementHistoryService } from './movement-history.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [MovementHistoryController],
  providers: [MovementHistoryService]
})
export class MovementHistoryModule {}
