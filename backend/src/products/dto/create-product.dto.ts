import { IsString, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  status: string;

  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  tradeName: string;

  @IsString()
  grade: string;

  @IsString()
  productType: string;

  @IsOptional()
  @IsString()
  derivative?: string;

  @IsString()
  cleanType: string;

  @IsString()
  unCode: string;

  @IsString()
  packaging: string;

  @IsString()
  shippingName: string; // will be used to map to shippingName

  @IsString()
  containerCategory: string;

  @IsString()
  containerType: string;

  @IsString()
  classType: string;

  @IsOptional()
  msds?: {
    msdcIssueDate: string;     
    msdsCertificate: string;
    remark: string;
  }[];
}