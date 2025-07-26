import {
  Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException
} from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly service: ExchangeRateService) {}

  @Post()
  create(@Body() dto: CreateExchangeRateDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('ID must be a number');
    }
    return this.service.findOne(id);
  }

 @Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdateExchangeRateDto) {
  return this.service.update(id, dto); // ✅ pass as string

}

@Delete(':id')
remove(@Param('id') id: string) {
  return this.service.remove(id); // ✅ no number casting
}
}
