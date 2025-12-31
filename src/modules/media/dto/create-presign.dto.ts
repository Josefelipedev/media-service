import {
  IsString,
  IsNotEmpty,
  IsMimeType,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePresignDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @IsMimeType()
  fileType: string;

  @IsObject()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  metadata?: Record<string, any>;
}
