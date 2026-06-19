import { apiFetch } from './client'

let categoriesCache: CategoryItem[] | null = null
let categoriesInflight: Promise<CategoryItem[]> | null = null
let allToolsCache: ToolItem[] | null = null
let allToolsInflight: Promise<ToolItem[]> | null = null

export type ToolItem = {
  slug: string
  name: string
  description: string
  href: string | null
  keywords: string
  isPopular: boolean
  requiresPro: boolean
  compressionMode: string | null
  accept: string | null
  category: {
    slug: string
    name: string
    iconName?: string
    iconBg?: string
    iconColor?: string
  }
}

export type CategoryItem = {
  slug: string
  name: string
  iconName: string
  iconBg: string
  iconColor: string
  toolCount: number
  examples: string
}

export async function fetchPopularTools(limit = 12) {
  const data = await apiFetch<{ tools: ToolItem[] }>(
    `/api/tools?popular=true&limit=${limit}`,
  )
  return data.tools
}

export async function fetchAllTools() {
  if (allToolsCache) return allToolsCache
  if (!allToolsInflight) {
    allToolsInflight = apiFetch<{ tools: ToolItem[] }>('/api/tools')
      .then((data) => {
        allToolsCache = data.tools
        return data.tools
      })
      .finally(() => {
        allToolsInflight = null
      })
  }
  return allToolsInflight
}

export async function fetchCategories() {
  if (categoriesCache) return categoriesCache
  if (!categoriesInflight) {
    categoriesInflight = apiFetch<{ categories: CategoryItem[] }>('/api/tools/categories')
      .then((data) => {
        categoriesCache = data.categories
        return data.categories
      })
      .finally(() => {
        categoriesInflight = null
      })
  }
  return categoriesInflight
}

export async function fetchCategoryBySlug(slug: string) {
  const categories = await fetchCategories()
  const cached = categories.find((category) => category.slug === slug)
  if (cached) return cached

  const data = await apiFetch<{ category: CategoryItem }>(`/api/tools/categories/${slug}`)
  return data.category
}

export async function fetchToolsByCategory(categorySlug: string) {
  const tools = await fetchAllTools()
  return tools.filter((tool) => tool.category.slug === categorySlug)
}

function filterToolsLocal(tools: ToolItem[], query: string, limit: number) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return tools
    .filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.toLowerCase().includes(q) ||
        tool.slug.includes(q.replace(/\s+/g, '-')),
    )
    .slice(0, limit)
}

export async function searchTools(query: string, limit = 10) {
  try {
    const data = await apiFetch<{ tools: ToolItem[]; count: number }>(
      `/api/tools/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    )
    return data.tools
  } catch {
    const all = await fetchAllTools()
    return filterToolsLocal(all, query, limit)
  }
}
