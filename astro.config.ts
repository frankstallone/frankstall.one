import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import partytown from '@astrojs/partytown'
import netlify from '@astrojs/netlify'
import mdx from '@astrojs/mdx'
import astroExpressiveCode from 'astro-expressive-code'
import tailwindcss from '@tailwindcss/vite'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

// export const prerender = false;

import react from '@astrojs/react'

// Astro 6 types its config against its bundled Vite instance, while
// @tailwindcss/vite resolves against the workspace Vite package.
const tailwindVitePlugins = tailwindcss() as unknown as NonNullable<
  NonNullable<Parameters<typeof defineConfig>[0]['vite']>['plugins']
>

// https://astro.build/config
export default defineConfig({
  adapter: netlify({
    imageCDN: false,
  }),
  site: 'https://frankstall.one',
  vite: {
    plugins: tailwindVitePlugins,
  },
  integrations: [
    astroExpressiveCode({
      themes: ['dracula-soft'],
      styleOverrides: {
        codeFontFamily: 'var(--font-mono)',
      },
      plugins: [pluginLineNumbers()],
    }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/sandbox/'),
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    react(),
  ],
})
