import { Body, Controller, Delete, Get, Param, Patch, Post, BadRequestException } from '@nestjs/common';
import { DepotAvgTariffService } from './depot-avg-tariff.service';
import { CreateDepotAvgTariffDto } from './dto/create-depot-avg-tariff.dto';
import { UpdateDepotAvgTariffDto } from './dto/update-depot-avg-tariff.dto';

@Controller('depot-avg-tariff')
export class DepotAvgTariffController {
    constructor(private readonly service: DepotAvgTariffService) {}

  @Get('next-tariff-code')
  async getNextTariffCode() {
    try {
      // Get the latest tariff
      const tariffs = await this.service.findAll();
      
      // Generate next code
      let nextNum = 1;
      
      if (tariffs.length > 0) {
        // Find the highest number in existing codes
        const regex = /RST-DAT-(\d+)/;
        const numbers = tariffs
          .map(t => {
            const match = t.tariffCode.match(regex);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(n => !isNaN(n));
        
        nextNum = Math.max(0, ...numbers) + 1;
      }
      
      // Format with leading zeros (5 digits)
      const paddedNum = nextNum.toString().padStart(5, '0');
      const nextTariffCode = `RST-DAT-${paddedNum}`;
      
      return { nextTariffCode };
    } catch (error) {
      throw new BadRequestException('Failed to generate next tariff code');
    }
  }

  @Post()
  create(@Body() dto: CreateDepotAvgTariffDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`Invalid ID: ${id}`);
    }
    return this.service.findOne(parsedId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepotAvgTariffDto) {
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`Invalid ID: ${id}`);
    }
    return this.service.update(parsedId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`Invalid ID: ${id}`);
    }
    return this.service.remove(parsedId);
  }
}
