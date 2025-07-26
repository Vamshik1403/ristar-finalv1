import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateContainerLeaseTariffDto {
  @IsBoolean()
  status: boolean;

  @IsString()
  tariffCode: string;

  @IsString()
  containerCategory: string;

  @IsString()
  containerType: string;

  @IsString()
  containerClass: string;

  @IsNumber()
  leaseRentPerDay: number;

  @IsString()
  currencyName: string;
}


