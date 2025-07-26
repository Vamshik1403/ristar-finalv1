import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {

}
