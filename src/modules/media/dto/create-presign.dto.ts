import {
  IsString,
  IsNotEmpty,
  IsMimeType,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePresignDto {
  @ApiProperty({
    description: 'Original file name.',
    maxLength: 255,
    example: 'avatar.png',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({
    description: 'Mime type of the file.',
    example: 'image/png',
  })
  @IsString()
  @IsNotEmpty()
  @IsMimeType()
  fileType: string;

  @ApiPropertyOptional({
    description: 'Optional metadata for the file.',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  metadata?: Record<string, any>;
}
