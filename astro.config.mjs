import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import netlify from '@astrojs/netlify';
import db from '@astrojs/db';

export const prerender = false;

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: netlify(),
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
  ],
});
