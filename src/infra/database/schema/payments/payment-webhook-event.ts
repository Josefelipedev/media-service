import { pgTable, text, jsonb, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const paymentWebhookEvent = pgTable(
  'PaymentWebhookEvent',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    provider: text('provider').notNull(),
    eventId: text('eventId').notNull(),
    type: text('type').notNull(),
    status: text('status').notNull(),
    payload: jsonb('payload').notNull(),
    receivedAt: timestamp('receivedAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
    processedAt: timestamp('processedAt', { mode: 'date' }),
  },
  (table) => ({
    providerIndex: index('PaymentWebhookEvent_provider_idx').on(
      table.provider,
      table.eventId,
    ),
  }),
);
