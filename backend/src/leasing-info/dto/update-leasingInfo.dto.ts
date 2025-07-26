// src/leasing-info/dto/update-leasing-info.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { LeasingInfoDto } from './create-leasingInfo.dto';

export class UpdateLeasingInfoDto extends PartialType(LeasingInfoDto) {}
