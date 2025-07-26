import { IsDateString, IsInt, IsString } from 'class-validator';

export class CreateProductMSDSDto {
  @IsDateString()
  msdcIssueDate: string;

  @IsString()
  msdsCertificate: string;

  @IsString()
  remark: string;

  @IsInt()
  productId: number;
}
