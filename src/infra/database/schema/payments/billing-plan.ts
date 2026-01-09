import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { billingProduct } from './billing-product';

export const billingPlan = pgTable(
  'BillingPlan',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    app: text('app').notNull(),
    productId: uuid('productId')
      .references(() => billingProduct.id)
      .notNull(),
    name: text('name').notNull(),
    interval: text('interval').notNull(),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull(),
    provider: text('provider').notNull(),
    providerPriceId: text('providerPriceId'),
    active: boolean('active').notNull().default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    appIndex: index('BillingPlan_app_idx').on(table.app),
    productIndex: index('BillingPlan_productId_idx').on(table.productId),
  }),
);
