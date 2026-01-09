import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'webchat' })
  @IsString()
  app: string;

  @ApiProperty({ example: 'Webchat Pro' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Pro plan for webchat.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'stripe' })
  @IsString()
  provider: string;

  @ApiPropertyOptional({ example: 'prod_123' })
  @IsOptional()
  @IsString()
  providerProductId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
