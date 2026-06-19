export type NavMenuItem = {
  label: string
  categories: string[]
  /** Show category links only (used for "More") */
  categoriesOnly?: boolean
}

export const NAV_MENU_ITEMS: NavMenuItem[] = [
  { label: 'Image Tools', categories: ['image-tools'] },
  { label: 'PDF Tools', categories: ['pdf-tools'] },
  { label: 'Video & Audio', categories: ['video-tools', 'audio-tools'] },
  { label: 'AI Writing', categories: ['ai-writing'] },
  { label: 'Dev & SEO', categories: ['developer-tools', 'seo-tools'] },
  {
    label: 'More',
    categories: [
      'text-tools',
      'calculators',
      'ai-generation',
      'converters',
      'compressors',
      'utilities',
      'security-tools',
    ],
    categoriesOnly: true,
  },
]

export const NAV_TOOLS_PER_SECTION = 6
