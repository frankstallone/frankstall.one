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

const buildRootCustomProperties = () => {
  const rootCustomProperties = {}
  const groups = [
    { values: colors, prefix: 'color' },
    { values: spacing, prefix: 'space' },
    { values: fontSize, prefix: 'size' },
    { values: lineHeight, prefix: 'leading' },
    { values: fontFamily, prefix: 'font' },
    { values: fontWeight, prefix: 'font' },
  ]

  groups.forEach(({ values, prefix }) => {
    Object.entries(values).forEach(([tokenKey, tokenValue]) => {
      rootCustomProperties[`--${prefix}-${tokenKey}`] =
        normalizeTokenValue(tokenValue)
    })
  })

  return rootCustomProperties
}

const buildCustomUtilities = () => {
  const utilities = {}
  const customUtilities = [
    { values: spacing, prefix: 'flow-space', property: '--flow-space' },
    { values: spacing, prefix: 'region-space', property: '--region-space' },
    { values: spacing, prefix: 'gutter', property: '--gutter' },
  ]

  customUtilities.forEach(({ values, prefix, property }) => {
    Object.entries(values).forEach(([tokenKey, tokenValue]) => {
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
    plugin(function ({ addBase }) {
      addBase({
        ':root': buildRootCustomProperties(),
      })
    }),
    plugin(function ({ addUtilities }) {
      addUtilities(buildCustomUtilities())
    }),
  ],
}
