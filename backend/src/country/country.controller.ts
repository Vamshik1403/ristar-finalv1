import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CountryService } from './country.service';
import CreateCountryDto from './dto/createcountry.dto';
import UpdateCountryDto from './dto/updatecountry.dto';

@Controller('country')
export class CountryController {
      constructor(private readonly countryService: CountryService) {}

       @Post()
       createCountry(@Body() createCountryDto: CreateCountryDto) {
         return this.countryService.create(createCountryDto);
       }
     
       @Get()
       findAllCurrencies() {
         return this.countryService.findAll();
       }
     
       @Get(':id')
       findOne(@Param('id') id: string) {
         return this.countryService.findOne(+id);
       }
     
       @Patch(':id')
       update(
         @Param('id') id: string,
         @Body() updateCountryDto: UpdateCountryDto,
       ) {
         return this.countryService.update(+id, updateCountryDto);
       }
     
       @Delete(':id')
       remove(@Param('id') id: string) {
         return this.countryService.remove(+id);
       }
}
