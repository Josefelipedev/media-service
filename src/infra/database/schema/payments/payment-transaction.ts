import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core';

export const paymentTransaction = pgTable(
  'PaymentTransaction',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    app: text('app').notNull(),
    ownerId: text('ownerId').notNull(),
    ownerType: text('ownerType').notNull(),
    provider: text('provider').notNull(),
    providerPaymentId: text('providerPaymentId'),
    type: text('type').notNull(),
    status: text('status').notNull(),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ownerIndex: index('PaymentTransaction_owner_idx').on(
      table.ownerId,
      table.ownerType,
      table.app,
    ),
  }),
);
