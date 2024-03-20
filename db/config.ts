import { defineDb, defineTable, column } from 'astro:db';
// https://astro.build/db/config

const Like = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    slug: column.text(),
  },
});

export default defineDb({
  tables: { Like },
});
