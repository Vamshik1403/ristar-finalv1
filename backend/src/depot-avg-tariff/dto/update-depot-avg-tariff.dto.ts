// dto/update-depot-avg-tariff.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDepotAvgTariffDto } from './create-depot-avg-tariff.dto';

export class UpdateDepotAvgTariffDto extends PartialType(CreateDepotAvgTariffDto) {}
