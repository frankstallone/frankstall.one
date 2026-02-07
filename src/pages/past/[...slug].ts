import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

export const prerender = false

const pastRootDirectory = path.join(process.cwd(), 'public', 'past')
const indexFileNames = ['index.html', 'index.htm']

const contentTypes = new Map([
  ['.avif', 'image/avif'],
  ['.bmp', 'image/bmp'],
  ['.class', 'application/java-vm'],
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.htm', 'text/html; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mid', 'audio/midi'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.pdf', 'application/pdf'],
  ['.php', 'text/plain; charset=utf-8'],
  ['.png', 'image/png'],
  ['.psd', 'application/octet-stream'],
  ['.shtml', 'text/html; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.swf', 'application/x-shockwave-flash'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
])

const isSafePath = (segments: string[]) =>
  segments.length > 0 && segments.every((segment) => segment && segment !== '.' && segment !== '..')

const getContentType = (filePath: string) => {
  const extension = path.extname(filePath).toLowerCase()
  return contentTypes.get(extension) ?? 'application/octet-stream'
}

const readIfFile = async (filePath: string) => {
  const fileStats = await stat(filePath).catch(() => null)
  if (!fileStats?.isFile()) {
    return null
  }

  return readFile(filePath)
}

const tryReadIndexFile = async (directoryPath: string) => {
  for (const fileName of indexFileNames) {
    const filePath = path.join(directoryPath, fileName)
    const fileContents = await readIfFile(filePath)
    if (fileContents) {
      return { filePath, fileContents }
    }
  }

  return null
}

export const GET = async ({ params, request }: { params: { slug?: string }; request: Request }) => {
  const rawSlug = params.slug ?? ''
  if (!rawSlug) {
    return Response.redirect(new URL('/archives/', request.url), 301)
  }

  const pathSegments = rawSlug.split('/').filter(Boolean)
  if (!isSafePath(pathSegments)) {
    return new Response(null, { status: 404 })
  }

  const requestUrl = new URL(request.url)
  const requestPathname = requestUrl.pathname
  const trailingSegment = pathSegments[pathSegments.length - 1]
  const hasFileExtension = path.extname(trailingSegment) !== ''

  if (!hasFileExtension) {
    if (!requestPathname.endsWith('/')) {
      return Response.redirect(new URL(`${requestPathname}/${requestUrl.search}`, request.url), 301)
    }

    const candidateDirectory = path.join(pastRootDirectory, ...pathSegments)
    const indexFile = await tryReadIndexFile(candidateDirectory)
    if (!indexFile) {
      return new Response(null, { status: 404 })
    }

    return new Response(new Uint8Array(indexFile.fileContents), {
      headers: {
        'content-type': getContentType(indexFile.filePath),
      },
    })
  }

  const requestedFilePath = path.join(pastRootDirectory, ...pathSegments)
  const fileContents = await readIfFile(requestedFilePath)
  if (!fileContents) {
    return new Response(null, { status: 404 })
  }

  return new Response(new Uint8Array(fileContents), {
    headers: {
      'content-type': getContentType(requestedFilePath),
    },
  })
}
