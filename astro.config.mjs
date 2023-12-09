import { defineConfig } from 'astro/config';
import purgecss from 'astro-purgecss';
import sitemap from '@astrojs/sitemap';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://frankstall.one',
  integrations: [
    purgecss(),
    sitemap(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
});
