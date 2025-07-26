import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TankCertificateService } from './tank-certificate.service';
import { TankCertificateController } from './tank-certificate.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TankCertificateController],
  providers: [TankCertificateService]
})
export class TankCertificateModule {}
