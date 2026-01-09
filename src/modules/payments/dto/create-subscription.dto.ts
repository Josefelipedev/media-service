import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'f4c0f2b3-2c64-4f22-9a9f-1f2d6f08c7f3' })
  @IsString()
  planId: string;

  @ApiProperty({ example: 'https://example.com/success' })
  @IsString()
  successUrl: string;

  @ApiProperty({ example: 'https://example.com/cancel' })
  @IsString()
  cancelUrl: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsString()
  customerEmail?: string;
}
