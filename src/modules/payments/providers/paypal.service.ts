import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaypalService {
  private readonly clientId?: string;
  private readonly clientSecret?: string;

  constructor(configService: ConfigService) {
    this.clientId = configService.get<string>('payments.paypal.clientId');
    this.clientSecret = configService.get<string>('payments.paypal.clientSecret');
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new Error('PayPal credentials are not configured.');
    }
  }
}
