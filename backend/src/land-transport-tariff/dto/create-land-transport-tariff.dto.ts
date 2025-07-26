// dto/create-land-transport-tariff.dto.ts
import { IsInt, IsString } from 'class-validator';

export class CreateLandTransportTariffDto {
  @IsString()
  landTransportTariffCode: string;

  @IsInt()
  addressBookId: number;

  @IsString()
  transportType: string;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  distance: string;

  @IsInt()
  currencyId: number;

  @IsString()
  amount: string;

  @IsString()
  approvalStatus: string;
}
