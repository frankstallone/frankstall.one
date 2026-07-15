import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

import { buildLlmsTxt } from '../lib/llms-txt'

export const prerender = true

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('The Astro site URL is required to generate llms.txt')
  }

  const posts = await getCollection('blog')

  return new Response(buildLlmsTxt(posts, site), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
