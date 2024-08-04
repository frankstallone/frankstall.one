import type { APIRoute } from 'astro';
import { sql, eq, db, Like } from 'astro:db';
export const prerender = false;

/**
 * Handles a POST request to like a post.
 * @param params - The parameters from the request URL.
 * @param request - The incoming request object.
 * @param clientAddress - The IP address of the client making the request.
 * @returns A response indicating the success of the like operation.
 */
export const POST: APIRoute = async ({ params, request, clientAddress }) => {
  // get slug of liked item assuming a request like `/api/like-post/[slug].ts`
  const { slug } = params;
  const userAgent = request.headers.get('user-agent');
  // hash the UA, IP address, and liked post slug to create a unique ID
  const id = await digest(userAgent + clientAddress + slug);
  // insert the like and ignore it if it was already set
  if (id && slug) {
    // check if the like already exists in the database
    const existingLike = await db.select().from(Like).where(eq(Like.id, id));
    // if the like exists, remove it from the database
    if (existingLike.length > 0) {
      await db.delete(Like).where(eq(Like.id, id));
      // Grab the current count of likes for the post
      const count = await countCurrentPostLikes(slug);
      return new Response(
        JSON.stringify({
          message: 'Successfully removed like!',
          count,
        }),
        {
          status: 200,
        },
      );
    }
    // insert the like and ignore it if it was already set
    await db.insert(Like).values({ id, slug }).onConflictDoNothing();
  }
  // return a response
  const count = await countCurrentPostLikes(slug || '');
  return new Response(
    JSON.stringify({
      message: 'Successfully liked!',
      count,
    }),
    {
      status: 200,
    },
  );
};

/**
 * Handles a GET request to check if a user has liked a post.
 * @param params - The parameters from the request URL.
 * @param request - The incoming request object.
 * @param clientAddress - The IP address of the client making the request.
 * @returns A response indicating whether the user has liked the post.
 */
export const GET: APIRoute = async ({ params, request, clientAddress }) => {
  // get slug of the post assuming a request like `/api/like-post/[slug].ts`
  const { slug } = params;
  const userAgent = request.headers.get('user-agent');
  // hash the UA, IP address, and post slug to create a unique ID
  const id = await digest(userAgent + clientAddress + slug);
  // check if the like exists in the database
  const existingLike = await db.select().from(Like).where(eq(Like.id, id));
  // return a response indicating whether the user has liked the post
  return new Response(
    JSON.stringify({
      liked: existingLike.length > 0,
    }),
    {
      status: 200,
    },
  );
};

/**
 * Counts the number of likes for a given post slug.
 * @param slug - The slug of the post.
 * @returns A promise that resolves to the number of likes.
 */
async function countCurrentPostLikes(slug: string): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(Like)
    .where(eq(Like.slug, slug));
  return count;
}

/**
 * Hashes the given message using SHA-256 algorithm.
 * @param message - The message to be hashed.
 * @returns A base64 encoded string representing the hashed message.
 */
async function digest(message: string) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
  return Buffer.from(hashBuffer).toString('base64');
}
