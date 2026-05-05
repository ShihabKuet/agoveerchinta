import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// GET /api/likes?postId=xxx
// Returns { count, liked } — liked is true if the current user liked this post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Count all likes for this post
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  // Check if this user has liked it
  let liked = false
  if (user) {
    const { data } = await supabase
      .from('likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()
    liked = !!data
  }

  return NextResponse.json({ count: count || 0, liked })
}

// POST /api/likes — toggle like on/off
// Body: { postId: string }
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await request.json()
  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 })
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Unlike
    await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
    return NextResponse.json({ liked: false })
  } else {
    // Like
    await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: user.id })
    return NextResponse.json({ liked: true })
  }
}
