import { PartialType } from '@nestjs/mapped-types';
import { OnHireReportDto } from './create-onhire-report.dto';

export class UpdateOnHireReportDto extends PartialType(OnHireReportDto) {}
