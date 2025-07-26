import { PartialType } from "@nestjs/mapped-types";
import CreateCountryDto from "./createcountry.dto";

export default class UpdateCountryDto extends PartialType(CreateCountryDto){}