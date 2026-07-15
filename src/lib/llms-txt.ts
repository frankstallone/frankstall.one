import type { CollectionEntry } from 'astro:content'

export type LlmsPost = Pick<CollectionEntry<'blog'>, 'id' | 'data'>

type CuratedLink = {
  title: string
  path: string
  description: string
}

const RECENT_POST_LIMIT = 6

const START_HERE_LINKS: CuratedLink[] = [
  {
    title: 'Home',
    path: '/',
    description:
      'Overview, recent writing, portfolio highlights, and an introduction to Frank',
  },
  {
    title: 'Portfolio',
    path: '/portfolio/',
    description: 'Selected product, brand, and design-system work',
  },
  {
    title: 'Blog',
    path: '/blog/',
    description:
      'Writing about design, systems, craft, accessibility, and web development',
  },
]

const CASE_STUDY_LINKS: CuratedLink[] = [
  {
    title: 'Klaviyo Ascent Design System: Phone input',
    path: '/portfolio/klaviyo-asecnt-design-system-phone-input/',
    description:
      'Research, interaction design, and React component work for an international phone input',
  },
  {
    title: 'Klaviyo Ascent Design System documentation site',
    path: '/portfolio/klaviyo-asecnt-design-system-documentation-site/',
    description:
      'Product specification, information architecture, and documentation strategy',
  },
  {
    title: 'Simpson Strong-Tie STUDS Design System',
    path: '/portfolio/design-system-lead-simpson-strong-tie/',
    description:
      'Design-system leadership, team growth, and organizational change',
  },
  {
    title: 'Roll by ADP',
    path: '/portfolio/roll-by-adp/',
    description: 'Simplifying mobile payroll for small-business owners',
  },
  {
    title: 'Builders Trust Capital',
    path: '/portfolio/btc/',
    description:
      'Brand strategy, identity, and website design for a hard-money lender',
  },
  {
    title: 'Loumarc Signs',
    path: '/portfolio/loumarc-signs/',
    description: 'Brand transformation, logo, website, and brand guidelines',
  },
]

const OPTIONAL_LINKS: CuratedLink[] = [
  {
    title: 'Uses',
    path: '/uses/',
    description: 'Hardware and software Frank uses',
  },
  {
    title: 'Accessibility statement',
    path: '/accessibility-statement/',
    description: 'Accessibility goals, standards, and contact information',
  },
  {
    title: 'Archives',
    path: '/archives/',
    description: 'Earlier versions of the site',
  },
]

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function escapeLinkLabel(value: string): string {
  return normalizeText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
}

function formatLink(site: URL, link: CuratedLink): string {
  const url = new URL(link.path, site)
  return `- [${escapeLinkLabel(link.title)}](${url.href}): ${normalizeText(link.description)}`
}

function formatSection(
  heading: string,
  links: CuratedLink[],
  site: URL,
): string[] {
  return [`## ${heading}`, '', ...links.map((link) => formatLink(site, link))]
}

function selectRecentPosts(posts: ReadonlyArray<LlmsPost>): LlmsPost[] {
  return [...posts]
    .filter((post) => !post.data.isDraft)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
    .slice(0, RECENT_POST_LIMIT)
}

export function buildLlmsTxt(
  posts: ReadonlyArray<LlmsPost>,
  site: URL,
): string {
  const recentPostLinks = selectRecentPosts(posts).map((post) => ({
    title: post.data.title,
    path: `/blog/${post.id}/`,
    description: post.data.description,
  }))

  return [
    '# Frank Stallone',
    '',
    '> Designer, developer, and mentor sharing 25 years of experience working on the web.',
    '',
    'Frank bridges design and development across SaaS products, design systems, marketing, accessibility, and web craft. Portfolio case studies describe selected client and product work; blog posts reflect Frank’s own perspective and experience.',
    '',
    ...formatSection('Start here', START_HERE_LINKS, site),
    '',
    ...formatSection('Selected case studies', CASE_STUDY_LINKS, site),
    '',
    ...formatSection('Recent writing', recentPostLinks, site),
    '',
    ...formatSection('Optional', OPTIONAL_LINKS, site),
    '',
  ].join('\n')
}
