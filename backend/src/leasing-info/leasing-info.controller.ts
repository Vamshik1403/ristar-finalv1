// src/leasing-info/leasing-info.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeasingInfoService } from './leasing-info.service';
import { UpdateLeasingInfoDto } from './dto/update-leasingInfo.dto';
import { LeasingInfoDto } from './dto/create-leasingInfo.dto';


@Controller('leasinginfo')
export class LeasingInfoController {
  constructor(private readonly service: LeasingInfoService) {}

  @Post()
  async create(@Body() data: LeasingInfoDto) {
  return this.service.create(data);
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
  update(@Param('id') id: string, @Body() dto: UpdateLeasingInfoDto) {
    return this.service.update(+id, dto,);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
