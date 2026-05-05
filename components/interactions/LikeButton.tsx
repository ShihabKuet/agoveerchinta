'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { cn, toBengaliNumerals } from '@/lib/utils'

interface LikeButtonProps {
  postId: string
  initialCount: number
}

export default function LikeButton({ postId, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [popping, setPopping] = useState(false)
  const supabase = createSupabaseBrowserClient()

  // Check if current user has already liked this post
  useEffect(() => {
    async function checkLike() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (data) setLiked(true)
    }
    checkLike()
  }, [postId])

  async function toggleLike() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // In v1.5 we'll open a sign-in modal here
      alert('লাইক দিতে লগইন করুন।')
      return
    }

    setLoading(true)

    // Optimistic update — update UI immediately before DB confirms
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount(c => wasLiked ? c - 1 : c + 1)

    // Pop animation
    setPopping(true)
    setTimeout(() => setPopping(false), 300)

    if (wasLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: user.id })
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bengali-sans font-semibold text-sm transition-all duration-200',
        liked
          ? 'bg-red-50 border-red-400 text-red-500'
          : 'bg-white border-[var(--color-border)] text-ink-muted hover:border-red-300 hover:text-red-400',
        loading && 'opacity-60 cursor-not-allowed'
      )}
      aria-label={liked ? 'লাইক সরান' : 'লাইক দিন'}
    >
      <Heart
        size={18}
        className={cn(
          'transition-all duration-200',
          liked && 'fill-red-500 text-red-500',
          popping && 'like-pop'
        )}
      />
      <span>
        {liked ? 'পছন্দ করেছেন' : 'পছন্দ করুন'}
        {count > 0 && (
          <span className="ml-1 opacity-70">({toBengaliNumerals(count)})</span>
        )}
      </span>
    </button>
  )
}
