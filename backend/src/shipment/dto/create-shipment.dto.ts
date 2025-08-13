import { Type } from 'class-transformer';
import { IsInt, IsString, IsDateString, IsArray, ValidateNested, IsOptional, IsBoolean, IsDate } from 'class-validator';



class ShipmentContainerDto {
  @IsString()
  containerNumber: string;

  @IsString()
  capacity: string;

  @IsString()
  tare: string;

  @IsInt()
  inventoryId: number;

  @IsInt()
  portId?: number;

  @IsString()
  depotName?: string;
}

export class CreateShipmentDto {
  @IsOptional()
  @IsString()
  quotationRefNumber?: string;

  @IsDateString()
  date: string;

  @IsString()
  refNumber: string;

  @IsString()
  masterBL: string;

  @IsString()
  shippingTerm: string;

  @IsInt()
  custAddressBookId: number;

  @IsInt()
  productId: number;

  @IsInt()
  consigneeAddressBookId: number;

  @IsInt()
  shipperAddressBookId: number;

  @IsInt()
  polPortId: number;

  @IsInt()
  podPortId: number;

  @IsString()
  polFreeDays: string;

  @IsString()
  podFreeDays: string;

  @IsString()
  polDetentionRate: string;

  @IsString()
  podDetentionRate: string;

  @IsInt()
  transhipmentPortId: number;

  @IsInt()
  expHandlingAgentAddressBookId: number;

  @IsInt()
  impHandlingAgentAddressBookId: number;

  @IsString()
  quantity: string;

  @IsString()
  containerNumber: string;

  @IsString()
  capacity: string;

  @IsString()
  tare: string;

  @IsInt()
  carrierAddressBookId: number;

  @IsString()
  vesselName: string;

  @IsDateString()
  gsDate: string;

  @IsOptional()
  @IsDateString()
  sob?: string;

  @IsDateString()
  etaTopod: string;

  @IsInt()
  emptyReturnDepotAddressBookId: number;

  @IsDateString()
  estimateDate: string;

  @IsOptional()
  @IsString()
  tankPreparation?: string;

  @IsOptional()
  @IsBoolean()
  hasCroGenerated?: boolean;

  @IsOptional()
  @IsDate()
  firstCroGenerationDate?: Date;

    @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentContainerDto)
  containers: ShipmentContainerDto[];

}
