import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly client?: Stripe;
  private readonly webhookSecret?: string;

  constructor(configService: ConfigService) {
    const secretKey = configService.get<string>('payments.stripe.secretKey');
    this.webhookSecret = configService.get<string>(
      'payments.stripe.webhookSecret',
    );

    if (secretKey) {
      this.client = new Stripe(secretKey);
    }
  }

  isConfigured(): boolean {
    return Boolean(this.client);
  }

  getClient(): Stripe {
    if (!this.client) {
      throw new Error('Stripe secret key is not configured.');
    }
    return this.client;
  }

  getWebhookSecret(): string {
    if (!this.webhookSecret) {
      throw new Error('Stripe webhook secret is not configured.');
    }
    return this.webhookSecret;
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const secret = this.getWebhookSecret();
    return Stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
