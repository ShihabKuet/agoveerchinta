import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// GET /api/comments?postId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles(username, full_name, avatar_url)')
    .eq('post_id', postId)
    .eq('is_approved', true)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/comments — submit a new comment
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { post_id, body, parent_id } = await request.json()

  if (!post_id || !body?.trim()) {
    return NextResponse.json({ error: 'post_id and body required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id,
      user_id: user.id,
      body: body.trim(),
      parent_id: parent_id || null,
    })
    .select('*, user:profiles(username, full_name, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
