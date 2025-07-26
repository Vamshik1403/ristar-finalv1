// dto/update-depot-cleaning-tariff.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDepotCleaningTariffDto } from './create-depot-cleaning-tariff.dto';

export class UpdateDepotCleaningTariffDto extends PartialType(CreateDepotCleaningTariffDto) {}
