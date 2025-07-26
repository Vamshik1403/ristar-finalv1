// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // Make the service globally available
@Module({
  providers: [PrismaService],
  exports: [PrismaService],  // Make sure it's exported
})
export class PrismaModule {}
