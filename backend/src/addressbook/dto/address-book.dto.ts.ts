import { 
  IsString, IsEmail, IsInt, IsOptional,
  ValidateNested, IsArray 
} from 'class-validator';
import { Type } from 'class-transformer';

class BankDetailsDto {
 @IsOptional() @IsOptional() @IsInt() id?: number;
 @IsOptional() @IsString() bankName: string;
 @IsOptional() @IsString() accountNumber: string;
 @IsOptional() @IsString() address: string;
 @IsOptional() @IsString() usci: string;
 @IsOptional() @IsString() branchName: string;
 @IsOptional() @IsString() branchCode: string;
 @IsOptional() @IsString() swiftCode: string;
 @IsOptional() @IsString() currency: string;
}

class BusinessPortDto {
  @IsOptional() @IsInt() id?: number;
  @IsInt() portId: number;
}

class ContactDto {
 @IsOptional() @IsOptional() @IsInt() id?: number;
 @IsOptional() @IsString() title: string;
 @IsOptional() @IsString() firstName: string;
 @IsOptional() @IsString() lastName: string;
 @IsOptional() @IsString() designation: string;
 @IsOptional() @IsString() department: string;
 @IsOptional() @IsEmail() email: string;
 @IsOptional() @IsString() mobile: string;
 @IsOptional() @IsString() landline: string;
}

export class CreateAddressBookDto {
 @IsOptional() @IsString() status: string;
 @IsOptional() @IsString() refId: string;
 @IsOptional() @IsString() businessType: string;
 @IsOptional() @IsString() companyName: string;
 @IsOptional() @IsString() address: string;
 @IsOptional() @IsString() phone: string;
 @IsOptional() @IsEmail() email: string;
 @IsOptional() @IsString() website: string;
 @IsOptional() @IsString() creditTerms: string;
 @IsOptional() @IsString() creditLimit: string;
 @IsOptional() @IsString() remark: string;
 @IsOptional() @IsInt() countryId: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BankDetailsDto)
  bankDetails: BankDetailsDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BusinessPortDto)
  businessPorts: BusinessPortDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];
}

export class UpdateAddressBookDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() refId?: string;
  @IsOptional() @IsString() businessType?: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() creditTerms?: string;
  @IsOptional() @IsString() creditLimit?: string;
  @IsOptional() @IsString() remark?: string;
  @IsOptional()   @Type(() => Number)
  countryId: number;

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessPortDto)
  businessPorts?: BusinessPortDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts?: ContactDto[];
}
