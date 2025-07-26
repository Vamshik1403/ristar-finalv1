// dto/create-handling-agent-tariff.dto.ts
import { IsInt, IsString } from 'class-validator';

export class CreateHandlingAgentTariffDto {
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
  impCommission: string;

  @IsString()
  expCommission: string;

  @IsString()
  transhipmentCommission: string;

  @IsString()
  emptyRepoCommission: string;

  @IsString()
  detentionCommission: string;
}
