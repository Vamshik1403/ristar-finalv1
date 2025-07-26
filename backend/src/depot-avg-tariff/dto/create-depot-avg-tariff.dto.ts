// dto/create-depot-avg-tariff.dto.ts
import { IsInt, IsString } from 'class-validator';

export class CreateDepotAvgTariffDto {
  @IsString()
  status: string;

  @IsString()
  tariffCode: string;

  @IsInt()
  addressBookId: number;

  @IsInt()
  portId: number;

  @IsInt()
  currencyId: number;

  @IsString()
  manlidPTFE: string;

  @IsString()
  leakTest: string;

  @IsString()
  loadOnLoadOff: string;

  @IsString()
  cleaningSurvey: string;

  @IsString()
  maintenanceAndRepair: string;

  @IsString()
  total: string;
}
