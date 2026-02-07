#!/usr/bin/env node

import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const archiveId = process.argv[2]

if (!archiveId) {
  console.error('Usage: npm run past:prepare -- <archive-id>')
  process.exit(1)
}

const archiveDir = path.join(process.cwd(), 'public', 'past', archiveId)
const mountBase = `/past/${archiveId}`
const textExtensionPattern = /\.(html|htm|css|js|mjs|xml|webmanifest)$/i

const replaceFromRoot = (content, fromPath, toPath) => {
  const escaped = fromPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(^|[\\s"'(=,:])${escaped}`, 'g')
  return content.replace(pattern, `$1${toPath}`)
}

const rewriteContent = (content) => {
  let next = content

  next = replaceFromRoot(next, `/${archiveId}//`, `${mountBase}/`)
  next = replaceFromRoot(next, `/${archiveId}/`, `${mountBase}/`)
  next = replaceFromRoot(next, '/assets/', `${mountBase}/assets/`)
  next = replaceFromRoot(next, '/fonts/', `${mountBase}/fonts/`)
  next = replaceFromRoot(next, '/posts/', `${mountBase}/posts/`)
  next = replaceFromRoot(next, '/portfolio/', `${mountBase}/portfolio/`)

  next = replaceFromRoot(next, '/apple-touch-icon.png', `${mountBase}/apple-touch-icon.png`)
  next = replaceFromRoot(next, '/android-chrome-192x192.png', `${mountBase}/android-chrome-192x192.png`)
  next = replaceFromRoot(next, '/android-chrome-384x384.png', `${mountBase}/android-chrome-384x384.png`)
  next = replaceFromRoot(next, '/browserconfig.xml', `${mountBase}/browserconfig.xml`)
  next = replaceFromRoot(next, '/favicon-16x16.png', `${mountBase}/favicon-16x16.png`)
  next = replaceFromRoot(next, '/favicon-32x32.png', `${mountBase}/favicon-32x32.png`)
  next = replaceFromRoot(next, '/favicon.ico', `${mountBase}/favicon.ico`)
  next = replaceFromRoot(next, '/mstile-150x150.png', `${mountBase}/mstile-150x150.png`)
  next = replaceFromRoot(next, '/safari-pinned-tab.svg', `${mountBase}/safari-pinned-tab.svg`)
  next = replaceFromRoot(next, '/site.webmanifest', `${mountBase}/site.webmanifest`)

  next = next.replace(/href=(["'])\/\1/g, `href=$1${mountBase}/$1`)

  return next
}

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return walk(fullPath)
      }

      return [fullPath]
    })
  )

  return files.flat()
}

const run = async () => {
  const archiveStats = await stat(archiveDir).catch(() => null)
  if (!archiveStats || !archiveStats.isDirectory()) {
    console.error(`Archive directory not found: ${archiveDir}`)
    process.exit(1)
  }

  const files = await walk(archiveDir)
  const textFiles = files.filter((filePath) => textExtensionPattern.test(filePath))

  let updatedCount = 0
  for (const filePath of textFiles) {
    const original = await readFile(filePath, 'utf8')
    const rewritten = rewriteContent(original)
    if (rewritten !== original) {
      await writeFile(filePath, rewritten, 'utf8')
      updatedCount += 1
    }
  }

  console.log(`Processed ${textFiles.length} files in public/past/${archiveId}`)
  console.log(`Updated ${updatedCount} files`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
