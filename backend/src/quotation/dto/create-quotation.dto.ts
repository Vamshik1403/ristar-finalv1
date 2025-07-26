import { IsInt, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateQuotationDto {
  @IsString()
  status: string;

  @IsNotEmpty()
  effectiveDate: string;

  @IsNotEmpty()
  validTillDate: string;

  @IsString()
  shippingTerm: string;

  @IsInt()
  custAddressBookId: number;

  @IsString()
  billingParty: string;

  @IsString()
  rateType: string;

  @IsString()
  billingType: string;

  @IsInt()
  productId: number;

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
  expDepotAddressBookId: number;

  @IsInt()
  emptyReturnAddressBookId: number;

  @IsInt()
  expHandlingAgentAddressBookId: number;

  @IsInt()
  impHandlingAgentAddressBookId: number;

  @IsString()
  transitDays: string;

  @IsInt()
  transhipmentPortId: number;

  @IsInt()
  transhipmentHandlingAgentAddressBookId: number;

  @IsString()
  slotRate: string;

  @IsString()
  depotAvgCost: string;

  @IsString()
  leasingCost: string;

  @IsString()
  depotCleaningCost: string;

  @IsString()
  terminalHandlingFee: string;

  @IsString()
  containerPreparationCost: string;

  @IsString()
  expAgencyCommission: string;

  @IsString()
  impAgencyCommission: string;

  @IsString()
  expCollectionCharges: string;

  @IsString()
  impCollectionCharges: string;

  @IsString()
  totalCost: string;

  @IsString()
  sellingAmount: string;

  @IsString()
  totalRevenueAmount: string;

  @IsString()
  totalPLAmount: string;

  @IsString()
  plMargin: string;
}
