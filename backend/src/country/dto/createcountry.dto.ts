import { IsInt, IsString } from "class-validator";

export default class CreateCountryDto {
    @IsString()
    countryCode: string;
    @IsString()
    countryName: string;
     @IsString()
    regions: string;
    @IsInt()
    currencyId: string;
   
}