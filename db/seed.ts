import { db, Like } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Like).values([
    { id: '1', slug: 'a-beginners-guide-to-digital-accessibility' },
    { id: '2', slug: 'a-beginners-guide-to-digital-accessibility' },
  ]);
}
