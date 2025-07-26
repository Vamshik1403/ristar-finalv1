import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class UpdateExchangeRateDto {
  @IsOptional()
  @IsNumber()
  fromCurrencyId?: number;

  @IsOptional()
  @IsNumber()
  toCurrencyId?: number;

  @IsOptional()
  @IsString()
  exchangeRate?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  variance?: string;
}
