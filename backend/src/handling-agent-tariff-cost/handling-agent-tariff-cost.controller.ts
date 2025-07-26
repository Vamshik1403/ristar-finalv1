import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateHandlingAgentTariffDto } from './dto/create-handling-agent-tariff.dto';
import { UpdateHandlingAgentTariffDto } from './dto/update-handling-agent-tariff.dto';
import { HandlingAgentTariffCostService } from './handling-agent-tariff-cost.service';

@Controller('handling-agent-tariff-cost')
export class HandlingAgentTariffCostController {
     constructor(private readonly service: HandlingAgentTariffCostService) {}

  @Get('next-tariff-code')
  async getNextTariffCode() {
    try {
      // Get all existing tariffs
      const tariffs = await this.service.findAll();
      
      // Generate next code using pattern RST-HA-00001 (HA = Handling Agent)
      let nextNum = 1;
      
      if (tariffs.length > 0) {
        // Find the highest number in existing codes
        const regex = /RST-HA-(\d+)/;
        const numbers = tariffs
          .map(t => {
            const match = t.tariffCode.match(regex);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(n => !isNaN(n));
        
        nextNum = numbers.length ? Math.max(0, ...numbers) + 1 : 1;
      }
      
      // Format with leading zeros (5 digits)
      const paddedNum = nextNum.toString().padStart(5, '0');
      const nextTariffCode = `RST-HA-${paddedNum}`;
      
      return { nextTariffCode };
    } catch (error) {
      console.error('Error generating next tariff code:', error);
      throw new BadRequestException('Failed to generate next tariff code');
    }
  }

  @Post()
  create(@Body() dto: CreateHandlingAgentTariffDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
@Get(':id')
findOne(@Param('id') id: string) {
  if (isNaN(Number(id))) {
    throw new BadRequestException(`Invalid numeric ID: ${id}`);
  }

  return this.service.findOne(Number(id));
}


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHandlingAgentTariffDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
