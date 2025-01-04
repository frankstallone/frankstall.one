/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'
import postcss from 'postcss'
import postcssJs from 'postcss-js'

import clampGenerator from './src/css-utils/clamp-generator.js'
import tokensToTailwind from './src/css-utils/tokens-to-tailwind.js'

// Raw design tokens
import colorTokens from './src/design-tokens/colors.json' assert { type: 'json' }
import fontTokens from './src/design-tokens/fonts.json' assert { type: 'json' }
import spacingTokens from './src/design-tokens/spacing.json' assert { type: 'json' }
import textSizeTokens from './src/design-tokens/text-sizes.json' assert { type: 'json' }
import textLeadingTokens from './src/design-tokens/text-leading.json' assert { type: 'json' }
import textWeightTokens from './src/design-tokens/text-weights.json' assert { type: 'json' }
import viewportTokens from './src/design-tokens/viewports.json' assert { type: 'json' }

// Process design tokens
const colors = tokensToTailwind(colorTokens.items)
const fontFamily = tokensToTailwind(fontTokens.items)
const fontWeight = tokensToTailwind(textWeightTokens.items)
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items))
const lineHeight = tokensToTailwind(textLeadingTokens.items)
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items))

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // Add color classes to safe list so they are always generated
  safelist: [],
  theme: {
    screens: {
      sm: `${viewportTokens.min}px`,
      md: `${viewportTokens.mid}px`,
      lg: `${viewportTokens.max}px`,
    },
    colors,
    spacing,
    fontSize,
    lineHeight,
    fontFamily,
    fontWeight,
    backgroundColor: ({ theme }) => theme('colors'),
    textColor: ({ theme }) => theme('colors'),
    margin: ({ theme }) => ({
      auto: 'auto',
      ...theme('spacing'),
    }),
    padding: ({ theme }) => theme('spacing'),
  },
  variantOrder: [
    'first',
    'last',
    'odd',
    'even',
    'visited',
    'checked',
    'empty',
    'read-only',
    'group-hover',
    'group-focus',
    'focus-within',
    'hover',
    'focus',
    'focus-visible',
    'active',
    'disabled',
  ],

  // Disables Tailwind's reset and usage of rgb/opacity
  corePlugins: {
    preflight: false,
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
  },

  // Prevents Tailwind's core components
  // blocklist: ["container"],

  // Prevents Tailwind from generating that wall of empty custom properties
  experimental: {
    optimizeUniversalDefaults: true,
  },

  plugins: [
    // Generates custom property values from tailwind config
    plugin(function ({ addComponents, config }) {
      let result = ''

      const currentConfig = config()

      const groups = [
        { key: 'colors', prefix: 'color' },
        { key: 'spacing', prefix: 'space' },
        { key: 'fontSize', prefix: 'size' },
        { key: 'lineHeight', prefix: 'leading' },
        { key: 'fontFamily', prefix: 'font' },
        { key: 'fontWeight', prefix: 'font' },
      ]

      groups.forEach(({ key, prefix }) => {
        const group = currentConfig.theme[key]

        if (!group) {
          return
        }

        Object.keys(group).forEach((key) => {
          result += `--${prefix}-${key}: ${group[key]};`
        })
      })

      addComponents({
        ':root': postcssJs.objectify(postcss.parse(result)),
      })
    }),

    // Generates custom utility classes
    plugin(function ({ addUtilities, config }) {
      const currentConfig = config()
      const customUtilities = [
        { key: 'spacing', prefix: 'flow-space', property: '--flow-space' },
        { key: 'spacing', prefix: 'region-space', property: '--region-space' },
        { key: 'spacing', prefix: 'gutter', property: '--gutter' },
      ]

      customUtilities.forEach(({ key, prefix, property }) => {
        const group = currentConfig.theme[key]

        if (!group) {
          return
        }

        Object.keys(group).forEach((key) => {
          addUtilities({
            [`.${prefix}-${key}`]: postcssJs.objectify(
              postcss.parse(`${property}: ${group[key]}`),
            ),
          })
        })
      })
    }),
  ],
}
