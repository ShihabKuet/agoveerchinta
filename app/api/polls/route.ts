import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json(null)
  }

  const supabase = await createSupabaseServerClient()

  // Step 1: Fetch poll + options (no nested vote count — avoids relationship ambiguity)
  const { data: poll, error } = await supabase
    .from('polls')
    .select('*, options:poll_options(id, label, sort_order)')
    .eq('post_id', postId)
    .eq('is_active', true)
    .single()

  if (error || !poll) {
    return NextResponse.json(null)
  }

  // Step 2: Fetch vote counts per option separately
  const { data: votes } = await supabase
    .from('poll_votes')
    .select('option_id')
    .eq('poll_id', poll.id)

  // Count votes per option
  const voteCounts: Record<string, number> = {}
  ;(votes || []).forEach(v => {
    voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1
  })

  // Merge vote counts into options
  const optionsWithCounts = poll.options.map((opt: { id: string; label: string; sort_order: number }) => ({
    ...opt,
    vote_count: voteCounts[opt.id] || 0,
  }))

  // Step 3: Check if current user has already voted
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

  return NextResponse.json({ ...poll, options: optionsWithCounts, userVotedOptionId })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { pollId, optionId } = await request.json()

  if (!pollId || !optionId) {
    return NextResponse.json({ error: 'pollId and optionId required' }, { status: 400 })
  }

  const { data: poll } = await supabase
    .from('polls')
    .select('is_active')
    .eq('id', pollId)
    .single()

  if (!poll?.is_active) {
    return NextResponse.json({ error: 'Poll is closed' }, { status: 400 })
  }

  // For logged-in users: upsert to prevent double voting
  // For anonymous: just insert
  if (user) {
    await supabase
      .from('poll_votes')
      .upsert(
        { poll_id: pollId, option_id: optionId, user_id: user.id },
        { onConflict: 'poll_id,user_id' }
      )
  } else {
    await supabase
      .from('poll_votes')
      .insert({ poll_id: pollId, option_id: optionId, user_id: null })
  }

  return NextResponse.json({ success: true })
}