import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core';

export const media = pgTable(
  'Media',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    key: text('key').notNull().unique(),
    url: text('url').notNull(),
    type: text('type').notNull(),
    size: integer('size').notNull(),
    ownerId: text('ownerId').notNull(),
    ownerType: text('ownerType').notNull(),
    app: text('app').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deletedAt', { mode: 'date' }),
  },
  (table) => ({
    ownerIndex: index('Media_ownerId_ownerType_idx').on(
      table.ownerId,
      table.ownerType,
    ),
    appIndex: index('Media_app_idx').on(table.app),
    createdAtIndex: index('Media_createdAt_idx').on(table.createdAt),
  }),
);
