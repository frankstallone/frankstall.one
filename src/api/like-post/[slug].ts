import type { APIRoute } from 'astro';
import { db, Like } from 'astro:db';
export const prerender = false;

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
  return new Response('Success', { status: 200 });
};

/** Get a SHA-256 hash for a string. */
async function digest(message: string) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
  return Buffer.from(hashBuffer).toString('base64');
}
