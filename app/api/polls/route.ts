import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'

// GET /api/polls?postId=xxx
// Returns poll with options and live vote counts for a post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const { data: poll, error } = await supabase
    .from('polls')
    .select('*, options:poll_options(*, vote_count:poll_votes(count))')
    .eq('post_id', postId)
    .eq('is_active', true)
    .single()

  if (error || !poll) {
    return NextResponse.json(null)  // No poll for this post — that's OK
  }

  // Check if current user has already voted
  const { data: { user } } = await supabase.auth.getUser()
  let userVotedOptionId: string | null = null

  if (user) {
    const { data: vote } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('poll_id', poll.id)
      .eq('user_id', user.id)
      .single()
    userVotedOptionId = vote?.option_id || null
  }

  return NextResponse.json({ ...poll, userVotedOptionId })
}

// POST /api/polls — cast a vote
// Body: { pollId: string, optionId: string }
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { pollId, optionId } = await request.json()

  if (!pollId || !optionId) {
    return NextResponse.json({ error: 'pollId and optionId required' }, { status: 400 })
  }

  // Check if poll is active
  const { data: poll } = await supabase
    .from('polls')
    .select('is_active')
    .eq('id', pollId)
    .single()

  if (!poll?.is_active) {
    return NextResponse.json({ error: 'Poll is closed' }, { status: 400 })
  }

  // Prevent duplicate votes — use upsert
  const { error } = await supabase
    .from('poll_votes')
    .upsert(
      {
        poll_id: pollId,
        option_id: optionId,
        user_id: user?.id || null,
      },
      { onConflict: 'poll_id,user_id' }  // One vote per user per poll
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
