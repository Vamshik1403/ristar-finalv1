import { PartialType } from '@nestjs/mapped-types';
import { CreateContainerLeaseTariffDto } from './create-container-lease-tariff.dto';

export class UpdateContainerLeaseTariffDto extends PartialType(CreateContainerLeaseTariffDto) {}
