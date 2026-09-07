import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import partytown from '@astrojs/partytown'
import netlify from '@astrojs/netlify'
import mdx from '@astrojs/mdx'
import astroExpressiveCode from 'astro-expressive-code'
import tailwindcss from '@tailwindcss/vite'
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

import react from '@astrojs/react'
import fontTokens from './src/design-tokens/fonts.json'

const [baseFont, displayFont, monoFont] = fontTokens.items

// Astro types its config against its bundled Vite instance, while
// @tailwindcss/vite resolves against the workspace Vite package.
const tailwindVitePlugins = tailwindcss() as unknown as NonNullable<
  NonNullable<Parameters<typeof defineConfig>[0]['vite']>['plugins']
>
const wgslPlugin = wgslVitePlugin() as unknown as NonNullable<
  NonNullable<Parameters<typeof defineConfig>[0]['vite']>['plugins']
>[number]

// https://astro.build/config
export default defineConfig({
  adapter: netlify({
    imageCDN: false,
  }),
  fonts: [
    {
      name: baseFont.value[0],
      cssVariable: '--font-base',
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: [
              './node_modules/@fontsource/geist/files/geist-latin-400-normal.woff2',
            ],
            display: 'swap',
          },
          {
            weight: 500,
            style: 'normal',
            src: [
              './node_modules/@fontsource/geist/files/geist-latin-500-normal.woff2',
            ],
            display: 'swap',
          },
          {
            weight: 700,
            style: 'normal',
            src: [
              './node_modules/@fontsource/geist/files/geist-latin-700-normal.woff2',
            ],
            display: 'swap',
          },
        ],
      },
      fallbacks: baseFont.value.slice(1),
    },
    {
      name: displayFont.value[0],
      cssVariable: '--font-display',
      provider: fontProviders.local(),
      fallbacks: displayFont.value.slice(1),
      options: {
        variants: [
          {
            weight: 100,
            style: 'normal',
            src: ['./src/assets/fonts/future/the-future-thin.woff2'],
            display: 'swap',
          },
          {
            weight: 100,
            style: 'italic',
            src: ['./src/assets/fonts/future/the-future-thin-italic.woff2'],
            display: 'swap',
          },
          {
            weight: 200,
            style: 'normal',
            src: ['./src/assets/fonts/future/the-future-extralight.woff2'],
            display: 'swap',
          },
          {
            weight: 200,
            style: 'italic',
            src: [
              './src/assets/fonts/future/the-future-extralight-italic.woff2',
            ],
            display: 'swap',
          },
          {
            weight: 300,
            style: 'normal',
            src: ['./src/assets/fonts/future/the-future-light.woff2'],
            display: 'swap',
          },
          {
            weight: 300,
            style: 'italic',
            src: ['./src/assets/fonts/future/the-future-light-italic.woff2'],
            display: 'swap',
          },
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/future/the-future-regular.woff2'],
            display: 'swap',
          },
          {
            weight: 400,
            style: 'italic',
            src: ['./src/assets/fonts/future/the-future-italic.woff2'],
            display: 'swap',
          },
          {
            weight: 500,
            style: 'normal',
            src: ['./src/assets/fonts/future/the-future-medium.woff2'],
            display: 'swap',
          },
          {
            weight: 500,
            style: 'italic',
            src: ['./src/assets/fonts/future/the-future-medium-italic.woff2'],
            display: 'swap',
          },
          {
            weight: 700,
            style: 'normal',
            src: ['./src/assets/fonts/future/the-future-bold.woff2'],
            display: 'swap',
          },
          {
            weight: 700,
            style: 'italic',
            src: ['./src/assets/fonts/future/the-future-bold-italic.woff2'],
            display: 'swap',
          },
          {
            weight: 900,
            style: 'normal',
            src: ['./src/assets/fonts/future/the-future-black.woff2'],
            display: 'swap',
          },
          {
            weight: 900,
            style: 'italic',
            src: ['./src/assets/fonts/future/the-future-black-italic.woff2'],
            display: 'swap',
          },
        ],
      },
    },
    {
      name: monoFont.value[0],
      cssVariable: '--font-mono',
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: [
              './node_modules/@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff2',
            ],
            display: 'swap',
          },
          {
            weight: 500,
            style: 'normal',
            src: [
              './node_modules/@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff2',
            ],
            display: 'swap',
          },
        ],
      },
      fallbacks: monoFont.value.slice(1),
    },
  ],
  site: 'https://frankstall.one',
  session: false,
  prefetch: true,
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  vite: {
    plugins: [...tailwindVitePlugins, wgslPlugin],
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
