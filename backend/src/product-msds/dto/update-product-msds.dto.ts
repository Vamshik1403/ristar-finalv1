import { PartialType } from '@nestjs/mapped-types';
import { CreateProductMSDSDto } from './create-product-msds.dto';

export class UpdateProductMSDSDto extends PartialType(CreateProductMSDSDto) {}
