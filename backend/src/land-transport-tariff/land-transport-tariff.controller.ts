import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateLandTransportTariffDto } from './dto/create-land-transport-tariff.dto';
import { UpdateLandTransportTariffDto } from './dto/update-land-transport-tariff.dto';
import { LandTransportTariffService } from './land-transport-tariff.service';

@Controller('land-transport-tariff')
export class LandTransportTariffController {
    constructor(private readonly service: LandTransportTariffService) {}

  // Add this new endpoint for generating the next tariff code
  @Get('next-tariff-code')
  async getNextTariffCode() {
    try {
      // Get all existing tariffs
      const tariffs = await this.service.findAll();
      
      // Generate next code using pattern RST-LT-00001
      let nextNum = 1;
      
      if (tariffs.length > 0) {
        // Find the highest number in existing codes
        const regex = /RST-LT-(\d+)/;
        const numbers = tariffs
          .map(t => {
            const match = t.landTransportTariffCode.match(regex);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(n => !isNaN(n));
        
        nextNum = numbers.length ? Math.max(0, ...numbers) + 1 : 1;
      }
      
      // Format with leading zeros (5 digits)
      const paddedNum = nextNum.toString().padStart(5, '0');
      const nextTariffCode = `RST-LT-${paddedNum}`;
      
      return { nextTariffCode };
    } catch (error) {
      console.error('Error generating next tariff code:', error);
      throw new BadRequestException('Failed to generate next tariff code');
    }
  }

  @Post()
  create(@Body() dto: CreateLandTransportTariffDto) {
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
  @UsePipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    forbidUnknownValues: false // Try this
  }))
  async update(@Param('id') id: string, @Body() dto: UpdateLandTransportTariffDto) {
    try {
      const parsedId = Number(id);
      if (isNaN(parsedId)) {
        throw new BadRequestException(`Invalid ID: ${id}`);
      }
      
      // Log incoming data
      
      return await this.service.update(parsedId, dto);
    } catch (error) {
      console.error("Update error:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update: ${error.message}`);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
