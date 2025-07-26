import { PartialType } from "@nestjs/mapped-types";
import CreateCurrencyDto from "./createcurrency.dto";

export class UpdateCurrencyDto extends PartialType(CreateCurrencyDto) {}
