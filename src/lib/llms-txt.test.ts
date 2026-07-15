import { describe, expect, it } from 'vitest'

import { buildLlmsTxt, type LlmsPost } from './llms-txt'

const site = new URL('https://frankstall.one')

function createPost(
  id: string,
  publishDate: string,
  options: { isDraft?: boolean; description?: string } = {},
): LlmsPost {
  return {
    id,
    data: {
      title: `Post ${id}`,
      description: options.description ?? `Description for ${id}`,
      publishDate: new Date(publishDate),
      isDraft: options.isDraft ?? false,
    },
  }
}

describe('buildLlmsTxt', () => {
  it('builds a spec-shaped guide with absolute links to the key site content', () => {
    const result = buildLlmsTxt([createPost('recent-post', '2026-06-01')], site)
    const curatedPaths = [
      '/',
      '/portfolio/',
      '/blog/',
      '/portfolio/klaviyo-asecnt-design-system-phone-input/',
      '/portfolio/klaviyo-asecnt-design-system-documentation-site/',
      '/portfolio/design-system-lead-simpson-strong-tie/',
      '/portfolio/roll-by-adp/',
      '/portfolio/btc/',
      '/portfolio/loumarc-signs/',
      '/uses/',
      '/accessibility-statement/',
      '/archives/',
    ]

    expect(result.startsWith('# Frank Stallone\n\n> Designer, developer')).toBe(
      true,
    )
    expect(result).toContain('## Start here')
    expect(result).toContain(
      '- [Portfolio](https://frankstall.one/portfolio/): Selected product, brand, and design-system work',
    )
    expect(result).toContain('## Selected case studies')
    expect(result).toContain('## Recent writing')
    expect(result).toContain('## Optional')
    curatedPaths.forEach((path) => {
      expect(result).toContain(new URL(path, site).href)
    })
    expect(result).toContain(
      '- [Post recent-post](https://frankstall.one/blog/recent-post/): Description for recent-post',
    )
    expect(result.endsWith('\n')).toBe(true)
  })

  it('lists only the six newest published posts without mutating the collection', () => {
    const posts = [
      createPost('oldest', '2026-01-01'),
      createPost('newest-draft', '2026-12-01', { isDraft: true }),
      createPost('second', '2026-06-01'),
      createPost('third', '2026-05-01'),
      createPost('fourth', '2026-04-01'),
      createPost('fifth', '2026-03-01'),
      createPost('sixth', '2026-02-01'),
      createPost('newest', '2026-07-01'),
    ]
    const originalOrder = posts.map((post) => post.id)

    const result = buildLlmsTxt(posts, site)

    expect(result).not.toContain('newest-draft')
    expect(result).not.toContain('oldest')
    expect(result.indexOf('newest/')).toBeLessThan(result.indexOf('second/'))
    expect(posts.map((post) => post.id)).toEqual(originalOrder)
  })

  it('normalizes multiline descriptions so each file-list item stays on one line', () => {
    const result = buildLlmsTxt(
      [
        createPost('multiline', '2026-06-01', {
          description: 'A description\nwith extra   spacing.',
        }),
      ],
      site,
    )

    expect(result).toContain(': A description with extra spacing.')
  })
})
