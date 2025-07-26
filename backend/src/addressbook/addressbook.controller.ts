import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CreateAddressBookDto, UpdateAddressBookDto } from './dto/address-book.dto.ts';
import { AddressbookService } from './addressbook.service';

@Controller('addressbook')
export class AddressbookController {
  constructor(private readonly addressbook: AddressbookService) {}

  @Post()
create(@Body() dto: CreateAddressBookDto) {
  return this.addressbook.create(dto);
}

@Get('next-ref-id')
getNextRefId() {
  return this.addressbook.getNextRefId();
}


  @Get()
  findAll() {
    return this.addressbook.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.addressbook.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressBookDto,
  ) {
    return this.addressbook.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.addressbook.remove(id);
  }
}
