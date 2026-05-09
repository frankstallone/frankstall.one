import type { APIRoute } from 'astro'
import { count, eq } from 'drizzle-orm'
import { Like } from 'db/schema'
import { db, dbStatus } from 'src/turso'
export const prerender = false

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  })

const databaseUnavailableResponse = () =>
  jsonResponse(
    {
      message: 'Database unavailable',
      reason: dbStatus.error ?? 'Unknown database init error',
      available: false,
    },
    503,
  )

/**
 * Handles a POST request to set a post's liked state.
 * @param params - The parameters from the request URL.
 * @param request - The incoming request object.
 * @param clientAddress - The IP address of the client making the request.
 * @returns A response indicating the current liked state and count.
 */
export const POST: APIRoute = async ({ params, request, clientAddress }) => {
  const { slug } = params
  if (!slug) {
    return jsonResponse({ message: 'Slug is required' }, 400)
  }

  if (!db) {
    return databaseUnavailableResponse()
  }

  const database = db
  let desiredLiked: unknown

  try {
    const body = (await request.json()) as { liked?: unknown }
    desiredLiked = body.liked
  } catch {
    return jsonResponse({ message: 'Request body must be JSON' }, 400)
  }

  if (typeof desiredLiked !== 'boolean') {
    return jsonResponse({ message: 'liked must be a boolean' }, 400)
  }

  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const clientId =
    clientAddress ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  const id = await digest(`${userAgent}:${clientId}:${slug}`)

  if (desiredLiked) {
    await database.insert(Like).values({ id, slug }).onConflictDoNothing()
  } else {
    await database.delete(Like).where(eq(Like.id, id))
  }

  const count = await countCurrentPostLikes(database, slug)
  return jsonResponse(
    {
      message: desiredLiked
        ? 'Successfully liked!'
        : 'Successfully removed like!',
      liked: desiredLiked,
      count,
      available: true,
    },
    200,
  )
}

/**
 * Handles a GET request to check if a user has liked a post.
 * @param params - The parameters from the request URL.
 * @param request - The incoming request object.
 * @param clientAddress - The IP address of the client making the request.
 * @returns A response indicating whether the user has liked the post.
 */
export const GET: APIRoute = async ({ params, request, clientAddress }) => {
  // get slug of the post assuming a request like `/api/like-post/[slug].ts`
  const { slug } = params
  if (!slug) {
    return jsonResponse({ message: 'Slug is required' }, 400)
  }

  if (!db) {
    return databaseUnavailableResponse()
  }

  const database = db

  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const clientId =
    clientAddress ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  // hash the UA, IP address, and post slug to create a unique ID
  const id = await digest(`${userAgent}:${clientId}:${slug}`)
  // check if the like exists in the database
  const existingLike = await database.select().from(Like).where(eq(Like.id, id))
  const count = await countCurrentPostLikes(database, slug)
  // return a response indicating whether the user has liked the post
  return jsonResponse(
    {
      liked: existingLike.length > 0,
      count,
      available: true,
    },
    200,
  )
}

type Database = NonNullable<typeof db>

/**
 * Counts the number of likes for a given post slug.
 * @param slug - The slug of the post.
 * @returns A promise that resolves to the number of likes.
 */
async function countCurrentPostLikes(
  database: Database,
  slug: string,
): Promise<number> {
  const [{ count: postLikesCount }] = await database
    .select({ count: count() })
    .from(Like)
    .where(eq(Like.slug, slug))
  return Number(postLikesCount)
}

/**
 * Hashes the given message using SHA-256 algorithm.
 * @param message - The message to be hashed.
 * @returns A base64 encoded string representing the hashed message.
 */
async function digest(message: string) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
  return Buffer.from(hashBuffer).toString('base64')
}
