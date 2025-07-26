// src/movement-history/dto/bulk-update-movement.dto.ts
import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class BulkUpdateMovementDto {
  @IsArray()
  ids: number[];

  @IsString()
  newStatus: string;

  @IsString()
  jobNumber: string;

  @IsOptional()
  @IsInt()
  portId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  addressBookId?: number;
  @IsOptional()
  @IsString()
  remarks?: string;
  @IsOptional()
  @IsISO8601()
  date?: string;
}
