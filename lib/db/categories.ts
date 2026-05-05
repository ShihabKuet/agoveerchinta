import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Category, SidebarTag } from '@/types'

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return []
  return data as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Category
}

// Tags with post counts for the sidebar tag cloud
export async function getTagsWithCounts(limit = 30): Promise<SidebarTag[]> {
  const supabase = await createSupabaseServerClient()

  // Get tags joined with count of published posts
  const { data, error } = await supabase
    .from('tags')
    .select('*, post_tags(count)')
    .order('name', { ascending: true })
    .limit(limit)

  if (error) return []

  return (data || []).map((tag: Record<string, unknown>) => ({
    ...tag,
    post_count: (tag.post_tags as { count: number }[])?.[0]?.count || 0,
  })) as SidebarTag[]
}
