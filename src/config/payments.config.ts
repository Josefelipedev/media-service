import { registerAs } from '@nestjs/config';

export default registerAs('payments', () => ({
  defaultCurrency: process.env.PAYMENTS_DEFAULT_CURRENCY || 'brl',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    webhookId: process.env.PAYPAL_WEBHOOK_ID,
    mode: process.env.PAYPAL_MODE || 'sandbox',
  },
}));
