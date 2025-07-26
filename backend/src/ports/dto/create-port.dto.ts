import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreatePortDto {
  @IsString() status: string;
  @IsString() portType: string;
  @IsString() portCode: string;
  @IsString() portLongName: string;
  @IsString() portName: string;

  @IsOptional()
  @IsInt()
  parentPortId?: number;

  @IsInt() currencyId: number;
  @IsInt() countryId: number;
}
