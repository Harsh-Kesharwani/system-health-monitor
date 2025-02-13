import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertType } from '../entities/alert.entity';

export class CreateAlertThresholdDto {
  @ApiProperty({
    enum: AlertType,
    description: 'Type of alert (cpu, memory, disk)',
  })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiProperty({
    minimum: 0,
    maximum: 100,
    description: 'Threshold value in percentage (0-100)',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  threshold: number;

  @ApiProperty({ required: false, description: 'Custom message for the alert' })
  @IsString()
  @IsOptional()
  message?: string;
}
