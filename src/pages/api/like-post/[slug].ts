import type { APIRoute } from 'astro';
import { db, Like } from 'astro:db';
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
    await db.insert(Like).values({ id, slug }).onConflictDoNothing();
  }
  // return a response
  return new Response(
    JSON.stringify({
      message: 'This was a POST!',
    }),
    {
      status: 200,
    },
  );
};

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
