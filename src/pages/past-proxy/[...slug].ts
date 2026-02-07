import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { getPastArchives } from '../../lib/past-archives'

const pastRootDirectory = path.join(process.cwd(), 'public', 'past')
export const prerender = false
const indexFileNames = ['index.html', 'index.htm']

const textContentExtensions = new Set([
  '.css',
  '.js',
  '.json',
  '.mjs',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml',
  '.html',
  '.htm',
])

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

const tryReadHtmlFile = async (filePath: string) => {
  const fileStats = await stat(filePath).catch(() => null)
  if (!fileStats?.isFile()) {
    return null
  }

  return readFile(filePath, 'utf8')
}

const hasIndexPage = async (directoryPath: string) => {
  for (const fileName of indexFileNames) {
    const filePath = path.join(directoryPath, fileName)
    const fileStats = await stat(filePath).catch(() => null)
    if (fileStats?.isFile()) {
      return true
    }
  }

  return false
}

const buildArchiveHref = (archiveSlug: string, nestedSegments: string[] = []) => {
  const encodedPath = [archiveSlug, ...nestedSegments].map((segment) => encodeURIComponent(segment)).join('/')
  return `/past/${encodedPath}`
}

const resolveArchiveHref = async (archiveSlug: string, nestedSegments: string[]) => {
  if (!nestedSegments.length) {
    return buildArchiveHref(archiveSlug)
  }

  const candidateDirectory = path.join(pastRootDirectory, archiveSlug, ...nestedSegments)
  if (await hasIndexPage(candidateDirectory)) {
    return buildArchiveHref(archiveSlug, nestedSegments)
  }

  return buildArchiveHref(archiveSlug)
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const buildArchiveControl = (label: string, href: string | null, relValue: 'prev' | 'next' | null) => {
  if (!href) {
    return `<span class="past-archive-nav__button past-archive-nav__button--disabled" aria-disabled="true">${escapeHtml(label)}</span>`
  }

  const relAttribute = relValue ? ` rel="${relValue}"` : ''
  return `<a class="past-archive-nav__button" href="${escapeHtml(href)}"${relAttribute}>${escapeHtml(label)}</a>`
}

const buildArchiveNavigatorMarkup = ({
  currentArchiveSlug,
  currentPosition,
  totalArchives,
  previousHref,
  nextHref,
}: {
  currentArchiveSlug: string
  currentPosition: number
  totalArchives: number
  previousHref: string | null
  nextHref: string | null
}) => {
  const previousControl = buildArchiveControl('Prev', previousHref, 'prev')
  const nextControl = buildArchiveControl('Next', nextHref, 'next')
  const allControl = buildArchiveControl('All', '/past/', null)
  const script = `
<script>
  (() => {
    const previousHref = ${JSON.stringify(previousHref)}
    const nextHref = ${JSON.stringify(nextHref)}
    const isTypingContext = (target) => {
      if (!(target instanceof HTMLElement)) return false
      if (target.isContentEditable) return true
      const tag = target.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    }
    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingContext(event.target)) return
      if (event.key === '[' && previousHref) {
        event.preventDefault()
        window.location.assign(previousHref)
      }
      if (event.key === ']' && nextHref) {
        event.preventDefault()
        window.location.assign(nextHref)
      }
    })
  })()
</script>`.trim()

  return `
<style>
#past-archive-frame {
  position: fixed;
  inset: 10px;
  border: 1px solid rgba(26, 32, 44, 0.18);
  border-radius: 16px;
  pointer-events: none;
  z-index: 2147483644;
}
#past-archive-nav {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483646;
  width: min(380px, calc(100vw - 24px));
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.65);
  background: rgba(15, 23, 42, 0.86);
  color: #f8fafc;
  box-shadow: 0 12px 32px rgba(2, 6, 23, 0.45);
  backdrop-filter: blur(8px);
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 12px;
}
#past-archive-nav * {
  box-sizing: border-box;
}
.past-archive-nav__title {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.9;
}
.past-archive-nav__meta {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.75;
}
.past-archive-nav__controls {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.past-archive-nav__button {
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(30, 41, 59, 0.78);
  color: #f8fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 160ms ease-out, border-color 160ms ease-out;
}
.past-archive-nav__button:hover,
.past-archive-nav__button:focus-visible {
  background: rgba(51, 65, 85, 0.95);
  border-color: rgba(226, 232, 240, 0.85);
}
.past-archive-nav__button:focus-visible {
  outline: 2px solid #f8fafc;
  outline-offset: 2px;
}
.past-archive-nav__button--disabled {
  opacity: 0.4;
}
@media (max-width: 760px) {
  #past-archive-frame {
    display: none;
  }
  #past-archive-nav {
    right: 8px;
    bottom: 8px;
    width: calc(100vw - 16px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .past-archive-nav__button {
    transition: none;
  }
}
</style>
<div id="past-archive-frame" aria-hidden="true"></div>
<nav id="past-archive-nav" aria-label="Past site navigation dock">
  <p class="past-archive-nav__title">Past Site ${escapeHtml(currentArchiveSlug)}</p>
  <div class="past-archive-nav__controls">
    ${previousControl}
    ${nextControl}
    ${allControl}
  </div>
  <p class="past-archive-nav__meta">Archive ${currentPosition} of ${totalArchives} • Keys: [ and ]</p>
</nav>
${script}`.trim()
}

const injectNavigatorIntoHtml = (html: string, navigatorMarkup: string) => {
  const bodyClosePattern = /<\/body\s*>/i
  if (bodyClosePattern.test(html)) {
    return html.replace(bodyClosePattern, `${navigatorMarkup}</body>`)
  }

  return `${html}${navigatorMarkup}`
}

const addArchiveNavigator = async (html: string, pathSegments: string[]) => {
  const normalizedSegments =
    pathSegments[pathSegments.length - 1] === 'index.html' || pathSegments[pathSegments.length - 1] === 'index.htm'
      ? pathSegments.slice(0, -1)
      : pathSegments

  const currentArchiveSlug = normalizedSegments[0]
  const nestedSegments = normalizedSegments.slice(1)
  const archives = await getPastArchives()
  const currentArchiveIndex = archives.findIndex((archive) => archive.slug === currentArchiveSlug)
  if (currentArchiveIndex < 0) {
    return html
  }

  const previousArchive = archives[currentArchiveIndex - 1]
  const nextArchive = archives[currentArchiveIndex + 1]
  const previousHref = previousArchive ? await resolveArchiveHref(previousArchive.slug, nestedSegments) : null
  const nextHref = nextArchive ? await resolveArchiveHref(nextArchive.slug, nestedSegments) : null

  return injectNavigatorIntoHtml(
    html,
    buildArchiveNavigatorMarkup({
      currentArchiveSlug,
      currentPosition: currentArchiveIndex + 1,
      totalArchives: archives.length,
      previousHref,
      nextHref,
    })
  )
}

const getContentType = (filePath: string) => {
  const extension = path.extname(filePath).toLowerCase()
  return contentTypes.get(extension) ?? 'application/octet-stream'
}

export const GET = async ({ params }: { params: { slug?: string } }) => {
  const rawSlug = params.slug ?? ''
  const pathSegments = rawSlug.split('/').filter(Boolean)

  if (!isSafePath(pathSegments)) {
    return new Response(null, { status: 404 })
  }

  const finalSegment = pathSegments[pathSegments.length - 1]
  const extension = path.extname(finalSegment).toLowerCase()
  const hasFileExtension = extension !== ''

  if (hasFileExtension) {
    const requestedFilePath = path.join(pastRootDirectory, ...pathSegments)
    const requestedFileStats = await stat(requestedFilePath).catch(() => null)
    if (!requestedFileStats?.isFile()) {
      return new Response(null, { status: 404 })
    }

    if (textContentExtensions.has(extension)) {
      const fileContents = await readFile(requestedFilePath, 'utf8')
      const htmlResponse =
        extension === '.html' || extension === '.htm'
          ? await addArchiveNavigator(fileContents, pathSegments)
          : fileContents

      return new Response(htmlResponse, {
        headers: {
          'content-type': getContentType(requestedFilePath),
        },
      })
    }

    const fileBuffer = await readFile(requestedFilePath)
    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        'content-type': getContentType(requestedFilePath),
      },
    })
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

    return new Response(await addArchiveNavigator(fileContents, pathSegments), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    })
  }

  return new Response(null, { status: 404 })
}
