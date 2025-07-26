import { IsOptional, IsDateString, IsString, IsInt } from 'class-validator';

export class CertificateDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsDateString()
  inspectionDate?: string;

  @IsOptional()
  @IsString()
  inspectionType?: string;

  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @IsOptional()
  @IsString()
  certificate?: string;

   @IsInt()
  inventoryId: number; 
}
