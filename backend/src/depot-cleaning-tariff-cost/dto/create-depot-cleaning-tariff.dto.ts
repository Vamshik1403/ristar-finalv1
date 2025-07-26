// dto/create-depot-cleaning-tariff.dto.ts
import { IsInt, IsString } from 'class-validator';

export class CreateDepotCleaningTariffDto {
  @IsString()
  status: string;

  @IsString()
  tariffCode: string;

  @IsInt()
  productId: number;

  @IsInt()
  addressBookId: number;

  @IsInt()
  portId: number;

  @IsInt()
  currencyId: number;

  @IsString()
  cleaningCharges: string;
}
