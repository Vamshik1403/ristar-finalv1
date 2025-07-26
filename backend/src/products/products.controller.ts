import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';


@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

 @Post()
@UseInterceptors(AnyFilesInterceptor())
create(@UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
  // body will have your fields, files will have uploaded files
  return this.productService.create(body, files);
}

   @Get('next-id')
  async getNextProductId() {
    return this.productService.getNextProductId();
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

@Patch(':id')
@UseInterceptors(AnyFilesInterceptor())
async update(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Body() updateProductDto: any
) {
  try {
    const updated = await this.productService.update(+id, updateProductDto, files);
    return updated;
  } catch (error) {
    console.error('Update error:', error);
    throw new InternalServerErrorException(error.message);
  }
}
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
