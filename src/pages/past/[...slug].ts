import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const pastRootDirectory = path.join(process.cwd(), 'public', 'past')
export const prerender = false

const isSafePath = (segments: string[]) =>
  segments.length > 0 && segments.every((segment) => segment && segment !== '.' && segment !== '..')

const tryReadHtmlFile = async (filePath: string) => {
  const fileStats = await stat(filePath).catch(() => null)
  if (!fileStats?.isFile()) {
    return null
  }

  return readFile(filePath, 'utf8')
}

export const GET = async ({ params }: { params: { slug?: string } }) => {
  const rawSlug = params.slug ?? ''
  const pathSegments = rawSlug.split('/').filter(Boolean)

  if (!isSafePath(pathSegments)) {
    return new Response(null, { status: 404 })
  }

  const finalSegment = pathSegments[pathSegments.length - 1]
  const hasFileExtension = path.extname(finalSegment) !== ''
  if (hasFileExtension) {
    return new Response(null, { status: 404 })
  }

  const candidateDirectory = path.join(pastRootDirectory, ...pathSegments)
  const htmlCandidatePaths = [
    path.join(candidateDirectory, 'index.html'),
    path.join(candidateDirectory, 'index.htm'),
  ]

  for (const htmlPath of htmlCandidatePaths) {
    const fileContents = await tryReadHtmlFile(htmlPath)
    if (!fileContents) {
      continue
    }

    return new Response(fileContents, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    })
  }

  return new Response(null, { status: 404 })
}
