import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import CreateCurrencyDto from './dto/createcurrency.dto';
import { CurrencyService } from './currency.service';
import { UpdateCurrencyDto } from './dto/updatecurrency.dto';

  @Controller('currency')
  export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}
  
  @Post()
  createCurrency(@Body() body: CreateCurrencyDto) {
  return this.currencyService.create(body);
  }

  @Get()
  findAllCurrencies() {
  return this.currencyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
  return this.currencyService.findOne(+id);
  }

  @Patch(':id')
  update(
  @Param('id') id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currencyService.update(+id, updateCurrencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.currencyService.remove(+id);
  }

}
