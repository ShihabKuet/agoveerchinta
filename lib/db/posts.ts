// ============================================================
//  Database Queries — Posts
//
//  WHY THIS FILE EXISTS:
//  All Supabase queries for posts live here. This keeps
//  components clean and makes it easy to swap the DB later.
// ============================================================

import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Post, PaginatedResponse } from '@/types'

// Fields we always join — reduces repetitive code
const POST_SELECT = `
  *,
  category:categories(*),
  author:profiles!author_id(id, username, full_name, avatar_url),
  tags:post_tags(tag:tags(*)),
  like_count:likes(count),
  comment_count:comments(count)
`

// ---- Fetch published posts with pagination ----
export async function getPosts({
  page = 1,
  pageSize = 12,
  categorySlug,
  tagSlug,
  postType,
  featured,
}: {
  page?: number
  pageSize?: number
  categorySlug?: string
  tagSlug?: string
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

  if (categorySlug) {
    query = query.eq('category.slug', categorySlug)
  }
  if (postType) {
    query = query.eq('post_type', postType)
  }
  if (featured !== undefined) {
    query = query.eq('is_featured', featured)
  }

  const { data, error, count } = await query

  if (error) throw new Error(error.message)

  return {
    data: (data as Post[]) || [],
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
  return data as Post
}

// ---- Fetch featured posts (for hero section) ----
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
  return (data as Post[]) || []
}

// ---- Fetch popular posts by view count ----
export async function getPopularPosts(limit = 5): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data as Post[]) || []
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
  return (data as Post[]) || []
}

// ---- Fetch related posts (same category, excluding current) ----
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
  return (data as Post[]) || []
}

// ---- Search posts by query string ----
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
  return (data as Post[]) || []
}
