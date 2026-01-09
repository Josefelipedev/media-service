import { ApiProperty } from '@nestjs/swagger';

export class BillingPlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  app: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  interval: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  providerPriceId?: string | null;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  metadata?: Record<string, unknown> | null;
}
