import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const paymentCustomer = pgTable(
  'PaymentCustomer',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    app: text('app').notNull(),
    ownerId: text('ownerId').notNull(),
    ownerType: text('ownerType').notNull(),
    email: text('email'),
    provider: text('provider').notNull(),
    providerCustomerId: text('providerCustomerId'),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ownerIndex: index('PaymentCustomer_owner_idx').on(
      table.ownerId,
      table.ownerType,
      table.app,
    ),
  }),
);
