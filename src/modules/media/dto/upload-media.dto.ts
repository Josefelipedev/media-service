import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({
    description: 'Application identifier.',
    example: 'finance',
    enum: ['webchat', 'finance'],
  })
  @IsString()
  @IsEnum(['webchat', 'finance'])
  app: string;

  @ApiPropertyOptional({
    description: 'Owner type for the media.',
    enum: ['user', 'company'],
    default: 'user',
  })
  @IsString()
  @IsOptional()
  @IsEnum(['user', 'company'])
  ownerType?: string;

  @ApiPropertyOptional({
    description: 'Optional JSON string with metadata.',
    example: '{"source":"web"}',
  })
  @IsOptional()
  metadata?: string;
}
