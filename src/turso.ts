import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';

let turso: ReturnType<typeof createClient> | undefined;
if (import.meta.env.TURSO_DATABASE_URL) {
  turso = createClient({
    url: import.meta.env.TURSO_DATABASE_URL,
    authToken: import.meta.env.TURSO_AUTH_TOKEN,
  });
}

export const db = turso ? drizzle(turso) : undefined as any;
