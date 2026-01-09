import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListMediaDto {
  @ApiPropertyOptional({
    description: 'Application identifier.',
    example: 'finance',
  })
  @IsString()
  @IsOptional()
  app?: string;

  @ApiPropertyOptional({
    description: 'Owner type for the media.',
    enum: ['user', 'company'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['user', 'company'])
  ownerType?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination.',
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page.',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Media mime type filter.',
    example: 'image/png',
  })
  @IsString()
  @IsOptional()
  type?: string;
}
