import { PartialType } from '@nestjs/mapped-types';
import { CreateBillOfLadingDto } from './create-bill-of-lading.dto';

export class UpdateBillOfLadingDto extends PartialType(CreateBillOfLadingDto) {}
