import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const billingProduct = pgTable('BillingProduct', {
  id: uuid('id').defaultRandom().primaryKey(),
  app: text('app').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  provider: text('provider').notNull(),
  providerProductId: text('providerProductId'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .notNull()
    .defaultNow(),
});
