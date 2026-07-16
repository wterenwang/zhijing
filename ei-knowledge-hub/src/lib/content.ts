const contentModules = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export function getContent(slug: string): string | null {
  const key = `../../content/${slug}.md`
  const content = contentModules[key]
  return typeof content === 'string' ? content : null
}

export function getAllContentSlugs(): string[] {
  return Object.keys(contentModules).map((key) =>
    key.replace('../../content/', '').replace('.md', ''),
  )
}
