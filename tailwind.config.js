/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'

import clampGenerator from './src/css-utils/clamp-generator.js'
import tokensToTailwind from './src/css-utils/tokens-to-tailwind.js'

// Raw design tokens
import colorTokens from './src/design-tokens/colors.json' with { type: 'json' }
import fontTokens from './src/design-tokens/fonts.json' with { type: 'json' }
import spacingTokens from './src/design-tokens/spacing.json' with { type: 'json' }
import textSizeTokens from './src/design-tokens/text-sizes.json' with { type: 'json' }
import textLeadingTokens from './src/design-tokens/text-leading.json' with { type: 'json' }
import textWeightTokens from './src/design-tokens/text-weights.json' with { type: 'json' }
import viewportTokens from './src/design-tokens/viewports.json' with { type: 'json' }

// Process design tokens
const colors = tokensToTailwind(colorTokens.items)
const fontFamily = tokensToTailwind(fontTokens.items)
const fontWeight = tokensToTailwind(textWeightTokens.items)
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items))
const lineHeight = tokensToTailwind(textLeadingTokens.items)
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items))
const normalizeTokenValue = (value) =>
  Array.isArray(value) ? value.join(', ') : `${value}`

const buildRootCustomProperties = (theme) => {
  const rootCustomProperties = {}
  const groups = [
    { key: 'colors', prefix: 'color' },
    { key: 'spacing', prefix: 'space' },
    { key: 'fontSize', prefix: 'size' },
    { key: 'lineHeight', prefix: 'leading' },
    { key: 'fontFamily', prefix: 'font' },
    { key: 'fontWeight', prefix: 'font' },
  ]

  groups.forEach(({ key, prefix }) => {
    const group = theme(key)

    if (!group || typeof group !== 'object') {
      return
    }

    Object.entries(group).forEach(([tokenKey, tokenValue]) => {
      rootCustomProperties[`--${prefix}-${tokenKey}`] =
        normalizeTokenValue(tokenValue)
    })
  })

  return rootCustomProperties
}

const buildCustomUtilities = (theme) => {
  const utilities = {}
  const customUtilities = [
    { key: 'spacing', prefix: 'flow-space', property: '--flow-space' },
    { key: 'spacing', prefix: 'region-space', property: '--region-space' },
    { key: 'spacing', prefix: 'gutter', property: '--gutter' },
  ]

  customUtilities.forEach(({ key, prefix, property }) => {
    const group = theme(key)

    if (!group || typeof group !== 'object') {
      return
    }

    Object.entries(group).forEach(([tokenKey, tokenValue]) => {
      utilities[`.${prefix}-${tokenKey}`] = {
        [property]: normalizeTokenValue(tokenValue),
      }
    })
  })

  return utilities
}

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
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
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        ':root': buildRootCustomProperties(theme),
      })
    }),
    plugin(function ({ addUtilities, theme }) {
      addUtilities(buildCustomUtilities(theme))
    }),
  ],
}
