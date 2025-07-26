// dto/update-handling-agent-tariff.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateHandlingAgentTariffDto } from './create-handling-agent-tariff.dto';

export class UpdateHandlingAgentTariffDto extends PartialType(CreateHandlingAgentTariffDto) {}
