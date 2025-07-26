import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OnHireReportDto } from 'src/on-hire-report/dto/create-onhire-report.dto';
import { LeasingInfoDto } from 'src/leasing-info/dto/create-leasingInfo.dto';
import { CertificateDto } from 'src/tank-certificate/dto/createTankCertificate.dto';


export class CreateInventoryDto {
  @IsString()
  status: string;

  @IsString()
  containerNumber: string;

  @IsString()
  containerCategory: string;

  @IsString()
  containerType: string;

  @IsString()
  containerSize: string;

  @IsString()
  containerClass: string;

  @IsString()
  containerCapacity: string;

  @IsString()
  capacityUnit: string;

  @IsString()
  manufacturer: string;

  @IsString()
  buildYear: string;

  @IsString()
  grossWeight: string;

  @IsString()
  tareWeight: string;

  @IsString()
  InitialSurveyDate: string;

  @IsOptional()
  @IsArray()
  @Type(() => CertificateDto)
  periodicTankCertificates?: CertificateDto[];

  @IsOptional()
  @IsArray()
  @Type(() => LeasingInfoDto)
  leasingInfo?: LeasingInfoDto[];

  @IsOptional()
  @IsArray()
  @Type(() => OnHireReportDto)
  onHireReport?: OnHireReportDto[];
}
