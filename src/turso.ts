import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'

type Database = ReturnType<typeof drizzle>

const tursoUrl = import.meta.env.TURSO_DATABASE_URL
const tursoAuthToken = import.meta.env.TURSO_AUTH_TOKEN

let db: Database | null = null
let dbError: string | null = null

if (!tursoUrl) {
  dbError = 'TURSO_DATABASE_URL is not set'
} else if (!tursoAuthToken) {
  dbError = 'TURSO_AUTH_TOKEN is not set'
} else {
  try {
    const client = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
    db = drizzle(client)
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : 'Unknown database init error'
  }
}

export { db, dbError }

export const dbStatus = {
  ready: db !== null,
  error: dbError,
}
