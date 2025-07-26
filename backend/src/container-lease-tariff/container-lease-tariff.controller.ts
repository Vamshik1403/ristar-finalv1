import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException } from '@nestjs/common';
import { ContainerLeaseTariffService } from './container-lease-tariff.service';
import { CreateContainerLeaseTariffDto } from './dto/create-container-lease-tariff.dto';
import { UpdateContainerLeaseTariffDto } from './dto/update-container-lease-tariff.dto';

@Controller('container-lease-tariff')
export class ContainerLeaseTariffController {
  constructor(private readonly service: ContainerLeaseTariffService) {}

  @Post()
  create(@Body() dto: CreateContainerLeaseTariffDto) {
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
  async update(@Param('id') id: string, @Body() updateDto: UpdateContainerLeaseTariffDto) {
    try {
      const updated = await this.service.update(+id, updateDto);
      return updated;
    } catch (error) {
      console.error('Update error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
