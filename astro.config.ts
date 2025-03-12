import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import partytown from '@astrojs/partytown'
import netlify from '@astrojs/netlify'
import astroExpressiveCode from 'astro-expressive-code'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

// export const prerender = false;

import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
  adapter: netlify({
    imageCDN: false,
  }),
  site: 'https://frankstall.one',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    astroExpressiveCode({
      themes: ['dracula-soft'],
      styleOverrides: {
        codeFontFamily: 'var(--font-mono)',
      },
      plugins: [pluginLineNumbers()],
    }),
    react(),
  ],
})
