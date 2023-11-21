import { defineConfig } from 'astro/config';
import purgecss from 'astro-purgecss';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://frankstall.one',
  integrations: [purgecss(), mdx(), sitemap()],
});
