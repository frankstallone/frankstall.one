// src/content.config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: z.object({
    isDraft: z.boolean(),
    title: z.string(),
    description: z.string(),
    subtitle: z.string().optional(),
    publishDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    image: z.string().optional(),
  }),
})

// Export collections object to register your collection(s)
export const collections = {
  blog: blog,
}
