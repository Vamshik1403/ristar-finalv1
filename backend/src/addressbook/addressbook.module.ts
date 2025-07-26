import { Module } from '@nestjs/common';
import { AddressbookController } from './addressbook.controller';
import { AddressbookService } from './addressbook.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AddressbookController],
  providers: [AddressbookService],
  exports: [AddressbookService],
})
export class AddressbookModule {}
