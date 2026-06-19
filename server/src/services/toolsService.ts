import { prisma } from '../db/client.js'

export async function listTools(filters?: {
  category?: string
  popular?: boolean
  limit?: number
}) {
  return prisma.tool.findMany({
    where: {
      isActive: true,
      ...(filters?.category
        ? { category: { slug: filters.category } }
        : {}),
      ...(filters?.popular ? { isPopular: true } : {}),
    },
    include: {
      category: {
        select: {
          slug: true,
          name: true,
          iconName: true,
          iconBg: true,
          iconColor: true,
        },
      },
    },
    orderBy: [{ isPopular: 'desc' }, { sortOrder: 'asc' }],
    take: filters?.limit,
  })
}

export async function searchTools(query: string, limit = 20) {
  const q = query.trim()
  if (!q) return []

  return prisma.tool.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { keywords: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q.replace(/\s+/g, '-'), mode: 'insensitive' } },
      ],
    },
    include: {
      category: {
        select: { slug: true, name: true, iconName: true, iconBg: true, iconColor: true },
      },
    },
    orderBy: [{ isPopular: 'desc' }, { sortOrder: 'asc' }],
    take: limit,
  })
}

export async function getToolBySlug(slug: string) {
  return prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  })
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      tools: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 3,
        select: { name: true },
      },
      _count: {
        select: {
          tools: { where: { isActive: true } },
        },
      },
    },
  })

  return categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    iconName: category.iconName,
    iconBg: category.iconBg,
    iconColor: category.iconColor,
    toolCount: category._count.tools,
    examples: category.tools.map((tool) => tool.name).join(' · '),
  }))
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          tools: { where: { isActive: true } },
        },
      },
    },
  })

  if (!category) return null

  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    iconName: category.iconName,
    iconBg: category.iconBg,
    iconColor: category.iconColor,
    toolCount: category._count.tools,
  }
}
