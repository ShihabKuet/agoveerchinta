// ============================================================
//  Database Queries — Posts
//
//  WHY THIS FILE EXISTS:
//  All Supabase queries for posts live here. This keeps
//  components clean and makes it easy to swap the DB later.
// ============================================================

import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Post, PaginatedResponse } from '@/types'

// likes and comments return [{count: N}] — we extract after fetch
const POST_SELECT = `
  *,
  category:categories(*),
  author:profiles!author_id(id, username, full_name, avatar_url),
  tags:post_tags(tag:tags(*)),
  likes(count),
  comments(count)
`

// Extract count from Supabase's [{count: N}] shape
function extractCount(val: unknown): number {
  if (Array.isArray(val) && val.length > 0) return Number(val[0]?.count) || 0
  if (typeof val === 'number') return val
  return 0
}

// Normalize raw Supabase row into a clean Post object
function normalizePost(raw: Record<string, unknown>): Post {
  return {
    ...raw,
    like_count: extractCount(raw.likes),
    comment_count: extractCount(raw.comments),
  } as Post
}

// ---- Get category ID from slug (needed for proper filtering) ----
async function getCategoryIdBySlug(slug: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()
  return data?.id || null
}

// ---- Fetch published posts with pagination ----
export async function getPosts({
  page = 1,
  pageSize = 12,
  categorySlug,
  postType,
  featured,
}: {
  page?: number
  pageSize?: number
  categorySlug?: string
  postType?: string
  featured?: boolean
} = {}): Promise<PaginatedResponse<Post>> {
  const supabase = await createSupabaseServerClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('posts')
    .select(POST_SELECT, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to)

  // Fix: look up category_id first, then filter by it
  if (categorySlug) {
    const categoryId = await getCategoryIdBySlug(categorySlug)
    if (!categoryId) return { data: [], count: 0, page, pageSize, totalPages: 0 }
    query = query.eq('category_id', categoryId)
  }

  if (postType) query = query.eq('post_type', postType)
  if (featured !== undefined) query = query.eq('is_featured', featured)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  return {
    data: (data as Record<string, unknown>[]).map(normalizePost),
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ---- Fetch a single post by slug ----
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) return null
  return normalizePost(data as Record<string, unknown>)
}

// ---- Fetch featured posts ----
export async function getFeaturedPosts(limit = 5): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data as Record<string, unknown>[]).map(normalizePost)
}

// ---- Fetch popular posts ----
export async function getPopularPosts(limit = 5): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data as Record<string, unknown>[]).map(normalizePost)
}

// ---- Fetch recent posts ----
export async function getRecentPosts(limit = 6): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data as Record<string, unknown>[]).map(normalizePost)
}

// ---- Fetch related posts ----
export async function getRelatedPosts(postId: string, categoryId: string, limit = 4): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data as Record<string, unknown>[]).map(normalizePost)
}

// ---- Search posts ----
export async function searchPosts(query: string, limit = 20): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,body_text.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data as Record<string, unknown>[]).map(normalizePost)
}
