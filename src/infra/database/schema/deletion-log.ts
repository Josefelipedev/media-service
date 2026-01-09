import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

export const deletionLog = pgTable('DeletionLog', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId').notNull(),
  userType: text('userType').notNull(),
  mediaCount: integer('mediaCount').notNull(),
  deletedBy: text('deletedBy').notNull(),
  reason: text('reason'),
  createdAt: timestamp('createdAt', { mode: 'date' })
    .notNull()
    .defaultNow(),
});
