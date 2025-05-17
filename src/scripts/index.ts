export interface Heading {
  depth: number
  text: string
  [key: string]: any
}

export interface TocHeading extends Heading {
  subheadings: TocHeading[]
}

export const buildHierarchy = (
  headings: Heading[] = [],
): TocHeading[] => {
  const toc: TocHeading[] = []
  const parentHeadings = new Map<number, TocHeading>()

  for (const h of headings) {
    const heading: TocHeading = { ...h, subheadings: [] }
    parentHeadings.set(heading.depth, heading)

    // Change 2 to 1 if your markdown includes your <h1>
    if (heading.depth === 2) {
      toc.push(heading)
    } else {
      const parent = parentHeadings.get(heading.depth - 1)
      if (parent) {
        parent.subheadings.push(heading)
      } else {
        toc.push(heading)
      }
    }
  }

  return toc
}
