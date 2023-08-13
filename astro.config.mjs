import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import image from '@astrojs/image';
import purgecss from 'astro-purgecss';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [
    sitemap(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    purgecss(),
    mdx(),
    sitemap(),
  ],
});
