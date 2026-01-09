import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { billingPlan } from './billing-plan';

export const paymentSubscription = pgTable(
  'PaymentSubscription',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    app: text('app').notNull(),
    ownerId: text('ownerId').notNull(),
    ownerType: text('ownerType').notNull(),
    provider: text('provider').notNull(),
    providerSubscriptionId: text('providerSubscriptionId'),
    planId: uuid('planId')
      .references(() => billingPlan.id)
      .notNull(),
    status: text('status').notNull(),
    currentPeriodEnd: timestamp('currentPeriodEnd', { mode: 'date' }),
    cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').notNull().default(false),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ownerIndex: index('PaymentSubscription_owner_idx').on(
      table.ownerId,
      table.ownerType,
      table.app,
    ),
  }),
);
