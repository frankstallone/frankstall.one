import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

export interface PastArchive {
  slug: string
  numericId: number | null
}

const pastRootDirectory = path.join(process.cwd(), 'public', 'past')
const indexFileNames = ['index.html', 'index.htm']

const hasIndexFile = async (directoryPath: string) => {
  for (const fileName of indexFileNames) {
    const filePath = path.join(directoryPath, fileName)
    const fileStats = await stat(filePath).catch(() => null)
    if (fileStats?.isFile()) {
      return true
    }
  }

  return false
}

const toNumericId = (slug: string) => {
  if (!/^\d+$/.test(slug)) {
    return null
  }

  const parsed = Number.parseInt(slug, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const archiveSort = (left: PastArchive, right: PastArchive) => {
  if (left.numericId !== null && right.numericId !== null) {
    return left.numericId - right.numericId
  }

  if (left.numericId !== null) {
    return -1
  }

  if (right.numericId !== null) {
    return 1
  }

  return left.slug.localeCompare(right.slug)
}

export const getPastArchives = async () => {
  const pastRootStats = await stat(pastRootDirectory).catch(() => null)
  if (!pastRootStats?.isDirectory()) {
    return []
  }

  const entries = await readdir(pastRootDirectory, { withFileTypes: true })
  const directories = entries.filter((entry) => entry.isDirectory())

  const archives = await Promise.all(
    directories.map(async (directory) => {
      const archivePath = path.join(pastRootDirectory, directory.name)
      const includesIndex = await hasIndexFile(archivePath)
      if (!includesIndex) {
        return null
      }

      return {
        slug: directory.name,
        numericId: toNumericId(directory.name),
      } satisfies PastArchive
    })
  )

  return archives.filter((archive): archive is PastArchive => Boolean(archive)).sort(archiveSort)
}
