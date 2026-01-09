import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'webchat' })
  @IsString()
  app: string;

  @ApiProperty({ example: 'c3f5c7d4-4a8b-4a01-9c03-12aefb8b3a1a' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Pro Monthly' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'month' })
  @IsString()
  interval: string;

  @ApiProperty({ example: 9900 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'brl' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'stripe' })
  @IsString()
  provider: string;

  @ApiPropertyOptional({ example: 'price_123' })
  @IsOptional()
  @IsString()
  providerPriceId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
