// dto/update-depot-cleaning-tariff.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateEmptyRepoJobDto } from './create-emptyRepoJob.dto';

export class UpdateEmptyRepoJobDto extends PartialType(CreateEmptyRepoJobDto) {}
