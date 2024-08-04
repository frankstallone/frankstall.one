import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import netlify from '@astrojs/netlify';
import db from '@astrojs/db';
import astroExpressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

// export const prerender = false;

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
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
    db(),
    astroExpressiveCode({
      themes: ['dracula-soft'],
      styleOverrides: {
        codeFontFamily: 'var(--font-mono)',
      },
      plugins: [pluginLineNumbers()],
    }),
  ],
});
