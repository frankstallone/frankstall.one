import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import colorTokens from '../src/design-tokens/colors.json' with { type: 'json' }
import fontTokens from '../src/design-tokens/fonts.json' with { type: 'json' }
import spacingTokens from '../src/design-tokens/spacing.json' with { type: 'json' }
import textLeadingTokens from '../src/design-tokens/text-leading.json' with { type: 'json' }
import textSizeTokens from '../src/design-tokens/text-sizes.json' with { type: 'json' }
import textWeightTokens from '../src/design-tokens/text-weights.json' with { type: 'json' }
import viewportTokens from '../src/design-tokens/viewports.json' with { type: 'json' }
import { buildTailwindCssArtifacts } from '../src/css-utils/tailwind-token-generator.js'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const outputDir = path.join(projectRoot, 'src/css/generated')

const writeArtifact = async (filename, contents) => {
  const filePath = path.join(outputDir, filename)
  await writeFile(filePath, contents, 'utf8')
  return filePath
}

const main = async () => {
  await mkdir(outputDir, { recursive: true })

  const { themeCss, compatCss, utilitiesCss } = buildTailwindCssArtifacts({
    colorTokens: colorTokens.items,
    fontTokens: fontTokens.items,
    spacingTokens: spacingTokens.items,
    textSizeTokens: textSizeTokens.items,
    textLeadingTokens: textLeadingTokens.items,
    textWeightTokens: textWeightTokens.items,
    viewportTokens,
  })

  const files = await Promise.all([
    writeArtifact('tailwind-theme.css', themeCss),
    writeArtifact('token-compat.css', compatCss),
    writeArtifact('tailwind-utilities.css', utilitiesCss),
  ])

  files.forEach((file) =>
    console.log(`wrote ${path.relative(projectRoot, file)}`),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
