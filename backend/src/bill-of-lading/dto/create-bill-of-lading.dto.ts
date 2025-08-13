import { IsString, IsOptional, IsNotEmpty, IsInt, IsBoolean, IsDate } from 'class-validator';

export class CreateBillOfLadingDto {
  @IsOptional()
  @IsInt()
  shipmentId?: number;

  @IsNotEmpty()
  @IsString()
  shippersName: string;

  @IsOptional()
  @IsString()
  shippersAddress?: string;

  @IsOptional()
  @IsString()
  shippersContactNo?: string;

  @IsOptional()
  @IsString()
  shippersEmail?: string;

  @IsNotEmpty()
  @IsString()
  consigneeName: string;

  @IsOptional()
  @IsString()
  consigneeAddress?: string;

  @IsOptional()
  @IsString()
  consigneeContactNo?: string;

  @IsOptional()
  @IsString()
  consigneeEmail?: string;

  @IsNotEmpty()
  @IsString()
  notifyPartyName: string;

  @IsOptional()
  @IsString()
  notifyPartyAddress?: string;

  @IsOptional()
  @IsString()
  notifyPartyContactNo?: string;

  @IsOptional()
  @IsString()
  notifyPartyEmail?: string;

  @IsNotEmpty()
  @IsString()
  sealNo: string;

  @IsNotEmpty()
  @IsString()
  grossWt: string;

  @IsNotEmpty()
  @IsString()
  netWt: string;

  @IsOptional()
  @IsString()
  billofLadingDetails?: string;

  @IsOptional()
  @IsString()
  freightPrepaid?: string;

  @IsOptional()
  @IsString()
  freightPostpaid?: string;

  @IsNotEmpty()
  @IsString()
  deliveryAgentName: string;

  @IsOptional()
  @IsString()
  deliveryAgentAddress?: string;

  @IsOptional()
  @IsString()
  Vat?: string;

  @IsOptional()
  @IsString()
  deliveryAgentContactNo?: string;

  @IsOptional()
  @IsString()
  deliveryAgentEmail?: string;

  @IsOptional()
  @IsString()
  freightAmount?: string;

  @IsOptional()
  @IsBoolean()
  hasDraftBlGenerated?: boolean;

  @IsOptional()
  @IsDate()
  firstGenerationDate?: Date;
}
