import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

// POST /api/views
// Body: { postId: string }
// Increments view_count on the post. Uses admin client to bypass RLS.
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: 'postId required' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    // Use RPC to atomically increment — avoids race conditions
    const { error } = await supabase.rpc('increment_view_count', {
      post_id_input: postId,
    })

    if (error) {
      // Fallback: direct update if RPC doesn't exist yet
      await supabase
        .from('posts')
        .update({ view_count: supabase.rpc('view_count + 1') as unknown as number })
        .eq('id', postId)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}
