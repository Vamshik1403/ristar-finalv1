import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DepotCleaningTariffCostService } from './depot-cleaning-tariff-cost.service';
import { CreateDepotCleaningTariffDto } from './dto/create-depot-cleaning-tariff.dto';
import { UpdateDepotCleaningTariffDto } from './dto/update-depot-cleaning-tariff.dto';

@Controller('depot-cleaning-tariff-cost')
export class DepotCleaningTariffCostController {
    constructor(private readonly service: DepotCleaningTariffCostService) {}

  // Add this new endpoint for generating the next tariff code
  @Get('next-tariff-code')
  async getNextTariffCode() {
    try {
      // Get all existing tariffs
      const tariffs = await this.service.findAll();
      
      // Generate next code using pattern RST-DC-00001 (DC = Depot Cleaning)
      let nextNum = 1;
      
      if (tariffs.length > 0) {
        // Extract all existing numbers from tariff codes
        const regex = /RST-DC-(\d+)/;
        const numbers = tariffs
          .map(t => {
            const match = t.tariffCode.match(regex);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => !isNaN(n) && n > 0);
        
        // Find the highest number
        if (numbers.length > 0) {
          nextNum = Math.max(...numbers) + 1;
        } else {
        }
      }
      
      // Format with leading zeros (5 digits)
      const paddedNum = nextNum.toString().padStart(5, '0');
      const nextTariffCode = `RST-DC-${paddedNum}`;
      
      return { nextTariffCode };
    } catch (error) {
      console.error('Error generating next tariff code:', error);
      throw new BadRequestException('Failed to generate next tariff code');
    }
  }

  @Post()
  create(@Body() dto: CreateDepotCleaningTariffDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDepotCleaningTariffDto) {
    try {
      const result = await this.service.update(+id, dto);
      return result;
    } catch (error) {
      console.error('Controller error during update:', error);
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
