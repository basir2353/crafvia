import { apiFetch } from './client'

export type AdminDashboard = {
  users: { total: number; pro: number; admins: number }
  tools: { total: number; active: number }
  jobs: { total: number; completed: number; failed: number; today: number }
  recentJobs: Array<{
    id: string
    toolSlug: string
    status: string
    originalSize: number
    compressedSize: number | null
    createdAt: string
    user: { email: string } | null
  }>
  topTools: Array<{ toolSlug: string; count: number }>
}

export type SiteConfigItem = { key: string; value: string }
export type ContentPage = { id: string; slug: string; title: string; body: string; updatedAt: string }
export type AdminCategory = {
  id: string
  slug: string
  name: string
  description: string | null
  iconName: string
  iconBg: string
  iconColor: string
  sortOrder: number
  _count: { tools: number }
}
export type AdminTool = {
  id: string
  slug: string
  name: string
  description: string
  href: string | null
  keywords: string
  isActive: boolean
  isPopular: boolean
  requiresPro: boolean
  sortOrder: number
  category: { slug: string; name: string }
}
export type AdminUser = {
  id: string
  email: string
  name: string | null
  plan: 'FREE' | 'PRO'
  role: 'USER' | 'ADMIN'
  createdAt: string
  _count: { processingJobs: number }
}

export function fetchAdminDashboard() {
  return apiFetch<AdminDashboard>('/api/admin/dashboard')
}

export function fetchSiteConfig() {
  return apiFetch<{ items: SiteConfigItem[] }>('/api/admin/site-config')
}

export function saveSiteConfig(items: SiteConfigItem[]) {
  return apiFetch<{ items: SiteConfigItem[] }>('/api/admin/site-config', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
}

export function fetchContentPages() {
  return apiFetch<{ pages: ContentPage[] }>('/api/admin/content-pages')
}

export function saveContentPage(slug: string, data: { title: string; body: string }) {
  return apiFetch<{ page: ContentPage }>(`/api/admin/content-pages/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function fetchAdminCategories() {
  return apiFetch<{ categories: AdminCategory[] }>('/api/admin/categories')
}

export function updateCategory(id: string, data: Partial<AdminCategory>) {
  return apiFetch<{ category: AdminCategory }>(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function fetchAdminTools(q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : ''
  return apiFetch<{ count: number; tools: AdminTool[] }>(`/api/admin/tools${query}`)
}

export function updateTool(id: string, data: Partial<AdminTool>) {
  return apiFetch<{ tool: AdminTool }>(`/api/admin/tools/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function fetchAdminUsers(q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : ''
  return apiFetch<{ count: number; users: AdminUser[] }>(`/api/admin/users${query}`)
}

export function updateUser(id: string, data: { plan?: 'FREE' | 'PRO'; role?: 'USER' | 'ADMIN' }) {
  return apiFetch<{ user: AdminUser }>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
