import { Optional } from "@nestjs/common";
import { IsString } from "class-validator";

export default class CreateCurrencyDto {
  @IsString()
  status: string;

  @IsString()
  currencyCode: string;

  @IsString()
  currencyName: string;

  @IsString()
  currencySymbol: string;
}
