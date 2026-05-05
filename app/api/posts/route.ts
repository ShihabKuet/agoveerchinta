import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { getPosts } from '@/lib/db/posts'

// GET /api/posts — list published posts with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10)
  const categorySlug = searchParams.get('category') || undefined
  const postType = searchParams.get('type') || undefined

  try {
    const result = await getPosts({ page, pageSize, categorySlug, postType })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/posts — create a new post (author/admin only)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        body: body.body,
        body_text: body.body_text,
        feature_image_url: body.feature_image_url,
        feature_image_alt: body.feature_image_alt,
        category_id: body.category_id,
        author_id: user.id,
        status: body.status || 'draft',
        post_type: body.post_type || 'article',
        is_featured: body.is_featured || false,
        published_at: body.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
