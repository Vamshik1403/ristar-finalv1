import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductMsdsService } from './product-msds.service';
import { CreateProductMSDSDto } from './dto/create-product-msds.dto';
import { UpdateProductMSDSDto } from './dto/update-product-msds.dto';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('product-msds')
export class ProductMsdsController {
  constructor(private readonly service: ProductMsdsService) {}

  @Post()
  async create(@Body() dto: CreateProductMSDSDto) {
    try {
      return await this.service.create(dto);
    } catch (error) {
      throw new HttpException(
        'Failed to create MSDS record',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
 update(@Param('id') id: string, @Body() data: UpdateProductDto) {
  return this.service.update(+id, data);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `msds-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    return { filename: file.filename };
  }
}
