// dto/update-land-transport-tariff.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLandTransportTariffDto } from './create-land-transport-tariff.dto';

export class UpdateLandTransportTariffDto extends PartialType(CreateLandTransportTariffDto) {}
