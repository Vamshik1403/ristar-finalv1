import { Module } from '@nestjs/common';
import { OnHireReportController } from './on-hire-report.controller';
import { OnHireReportService } from './on-hire-report.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnHireReportController],
  providers: [OnHireReportService]
})
export class OnHireReportModule {}
