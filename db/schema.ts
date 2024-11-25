import { text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const Like = sqliteTable('like', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
});
