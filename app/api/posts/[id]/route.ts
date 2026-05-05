import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

interface Props {
  params: { id: string }
}

// PATCH /api/posts/:id — update a post
export async function PATCH(request: NextRequest, { params }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // If publishing now, set published_at
    const updates: Record<string, unknown> = { ...body }
    if (body.status === 'published' && !body.published_at) {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', params.id)
      .eq('author_id', user.id)  // Authors can only edit their own
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/posts/:id
export async function DELETE(request: NextRequest, { params }: Props) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', params.id)
    .eq('author_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
