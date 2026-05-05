// ============================================================
//  AgoveerChinta — Shared TypeScript Types
//  These mirror the Supabase database schema exactly.
//  Import from here everywhere: import type { Post } from '@/types'
// ============================================================

export type UserRole = 'reader' | 'author' | 'admin'
export type PostStatus = 'draft' | 'published' | 'archived'
export type PostType = 'article' | 'poem' | 'story' | 'novel' | 'book_review' | 'download'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Category {
  id: string
  name: string        // Bengali name: সাহিত্য
  slug: string        // URL slug: sahitya
  description: string | null
  color: string       // Hex color for UI badges
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: Record<string, unknown>   // Tiptap JSON
  body_text: string | null         // Plaintext for search/reading time
  feature_image_url: string | null
  feature_image_alt: string | null
  category_id: string | null
  author_id: string
  status: PostStatus
  is_featured: boolean
  is_breaking: boolean
  post_type: PostType
  view_count: number
  reading_time_min: number | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined fields (from Supabase joins)
  category?: Category
  author?: Profile
  tags?: Tag[]
  like_count?: number
  comment_count?: number
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  body: string
  is_approved: boolean
  created_at: string
  updated_at: string
  // Joined
  user?: Profile
  replies?: Comment[]
}

export interface Like {
  post_id: string
  user_id: string
  created_at: string
}

export interface Poll {
  id: string
  post_id: string
  question: string
  is_active: boolean
  created_at: string
  options?: PollOption[]
}

export interface PollOption {
  id: string
  poll_id: string
  label: string
  sort_order: number
  vote_count?: number  // Aggregated from poll_votes
}

export interface PollVote {
  poll_id: string
  option_id: string
  user_id: string | null
  ip_hash: string | null
  created_at: string
}

// ============================================================
// API Response Types
// ============================================================

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  error: string
  status: number
}

// ============================================================
// UI-only types
// ============================================================

// For the homepage feed sections
export interface PostSection {
  title: string
  posts: Post[]
  viewAllHref?: string
}

// For sidebar widgets
export interface SidebarTag extends Tag {
  post_count: number
}
