import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class LeasingInfoDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  ownershipType: string;

  @IsString()
  leasingRefNo: string;

  @IsInt()
  leasoraddressbookId: number;

  @IsInt()
  onHireDepotaddressbookId: number;

  @IsInt()
  portId: number;

   @IsInt()
  inventoryId: number;

   @IsOptional()
  @IsDateString()
  onHireDate?: string;

  @IsOptional()
  @IsDateString()
  offHireDate?: string;


  @IsString()
  leaseRentPerDay: string;

  @IsString()
  remarks: string;
}
