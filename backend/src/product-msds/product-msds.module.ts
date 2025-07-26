import { Module } from '@nestjs/common';
import { ProductMsdsController } from './product-msds.controller';
import { ProductMsdsService } from './product-msds.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ProductMsdsController],
  providers: [ProductMsdsService]
})
export class ProductMsdsModule {}
