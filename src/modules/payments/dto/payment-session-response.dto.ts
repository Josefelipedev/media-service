import { ApiProperty } from '@nestjs/swagger';

export class PaymentSessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  url: string;
}
