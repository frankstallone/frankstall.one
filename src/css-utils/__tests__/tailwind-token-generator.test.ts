import { describe, expect, it } from 'vitest'

import colors from '../../design-tokens/colors.json'
import fonts from '../../design-tokens/fonts.json'
import spacing from '../../design-tokens/spacing.json'
import textLeading from '../../design-tokens/text-leading.json'
import textSizes from '../../design-tokens/text-sizes.json'
import textWeights from '../../design-tokens/text-weights.json'
import viewports from '../../design-tokens/viewports.json'
import {
  buildTailwindCssArtifacts,
  createClampValue,
  slugTokenName,
} from '../tailwind-token-generator.js'

describe('tailwind token generator', () => {
  it('slugifies token names the same way as the existing Tailwind bridge', () => {
    expect(slugTokenName('2XS - XS')).toBe('2xs-xs')
    expect(slugTokenName('Step 000')).toBe('step-000')
    expect(slugTokenName('Blue Vivid 500')).toBe('blue-vivid-500')
  })

  it('preserves the existing clamp math for spacing and type tokens', () => {
    expect(createClampValue({ min: 18, max: 24 }, viewports)).toBe(
      'clamp(1.125rem, 0.99rem + 0.67vw, 1.5rem)',
    )
    expect(createClampValue({ min: 21.6, max: 25 }, viewports)).toBe(
      'clamp(1.35rem, 1.27rem + 0.38vw, 1.5625rem)',
    )
  })

  it('emits theme variables, compatibility aliases, and custom utilities', () => {
    const { themeCss, compatCss, utilitiesCss } = buildTailwindCssArtifacts({
      colorTokens: colors.items,
      fontTokens: fonts.items,
      spacingTokens: spacing.items,
      textSizeTokens: textSizes.items,
      textLeadingTokens: textLeading.items,
      textWeightTokens: textWeights.items,
      viewportTokens: viewports,
    })

    expect(themeCss).toContain('--color-gray-100: #fcfcfc;')
    expect(themeCss).toContain(
      '--spacing-2xs-xs: clamp(0.5625rem, 0.36rem + 1.00vw, 1.125rem);',
    )
    expect(themeCss).toContain(
      '--text-step-1: clamp(1.35rem, 1.27rem + 0.38vw, 1.5625rem);',
    )
    expect(themeCss).toContain('--font-display: Future, sans-serif;')
    expect(themeCss).toContain('--font-weight-regular: 400;')
    expect(themeCss).toContain('--leading-fine: 1.15;')
    expect(themeCss).toContain('--breakpoint-md: 760px;')

    expect(compatCss).toContain('--space-s: var(--spacing-s);')
    expect(compatCss).not.toContain('--size-step-1:')
    expect(compatCss).not.toContain('--font-bold:')
    expect(compatCss).not.toContain('--gray-11:')

    expect(utilitiesCss).toContain('@utility flow-space-s {')
    expect(utilitiesCss).toContain('--flow-space: var(--spacing-s);')
    expect(utilitiesCss).toContain('@utility region-space-l-xl {')
    expect(utilitiesCss).toContain('@utility gutter-zero {')
  })
})
