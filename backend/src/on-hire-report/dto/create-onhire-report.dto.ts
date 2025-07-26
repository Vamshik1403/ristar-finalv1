import { IsOptional, IsDateString, IsString, IsInt } from 'class-validator';

export class OnHireReportDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsDateString()
  reportDate?: string;

  @IsOptional()
  @IsString()
  reportDocument?: string;

   @IsInt()
  inventoryId: number; 

}
