import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateExchangeRateDto {
  @IsNumber()
  fromCurrencyId: number;

  @IsNumber()
  toCurrencyId: number;

  @IsString() // stored as string in DB
  exchangeRate: string;

  @IsDateString()
  date: string;

  @IsString() // stored as string in DB (and optional)
  variance?: string;
}
