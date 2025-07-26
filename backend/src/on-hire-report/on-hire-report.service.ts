import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOnHireReportDto } from './dto/update-onhire-report.dto';
import { OnHireReportDto } from './dto/create-onhire-report.dto';

@Injectable()
export class OnHireReportService {
  constructor(private prisma: PrismaService) {}

  create(data: OnHireReportDto) {
    const formattedData = {
      reportDate: data.reportDate
        ? new Date(data.reportDate).toISOString()
        : new Date().toISOString(),
      reportDocument:
        typeof data.reportDocument === 'object'
          ? JSON.stringify(data.reportDocument)
          : data.reportDocument,
      inventoryId: data.inventoryId, // ✅ Required
    };

    return this.prisma.onHireReport.create({ data: formattedData });
  }

  findAll() {
    return this.prisma.onHireReport.findMany();
  }

  findOne(id: number) {
    return this.prisma.onHireReport.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateOnHireReportDto) {
    const formattedData: any = {};

    if (data.reportDate) {
      formattedData.reportDate = new Date(data.reportDate).toISOString();
    }

    if (data.reportDocument !== undefined) {
      formattedData.reportDocument =
        typeof data.reportDocument === 'object'
          ? JSON.stringify(data.reportDocument)
          : data.reportDocument;
    }

    return this.prisma.onHireReport.update({
      where: { id },
      data: formattedData,
    });
  }

  async remove(id: number) {
    const report = await this.prisma.onHireReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`OnHireReport with ID ${id} not found`);
    }
    return await this.prisma.onHireReport.delete({ where: { id } });
  }
}