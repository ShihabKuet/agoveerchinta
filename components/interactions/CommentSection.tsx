'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MessageCircle, Send, ChevronDown } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatRelativeDate, toBengaliNumerals } from '@/lib/utils'
import type { Comment } from '@/types'

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [body, setBody] = useState('')
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    loadComments()
    checkUser()
  }, [postId])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user ? { id: user.id, email: user.email || '' } : null)
  }

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, user:profiles(username, full_name, avatar_url)')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .is('parent_id', null)   // Top-level only
      .order('created_at', { ascending: false })
      .limit(50)

    setComments((data as Comment[]) || [])
    setLoading(false)
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !user) return

    setSubmitting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        body: body.trim(),
      })
      .select('*, user:profiles(username, full_name, avatar_url)')
      .single()

    if (!error && data) {
      setComments(prev => [data as Comment, ...prev])
      setBody('')
    }

    setSubmitting(false)
  }

  return (
    <section className="mt-8">
      <div className="section-heading">
        <h2 className="flex items-center gap-2">
          <MessageCircle size={20} className="text-accent" />
          মন্তব্য
          {comments.length > 0 && (
            <span className="text-base font-normal text-ink-muted">
              ({toBengaliNumerals(comments.length)})
            </span>
          )}
        </h2>
      </div>

      {/* Comment form */}
      {user ? (
        <form onSubmit={submitComment} className="mb-8">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="আপনার মন্তব্য লিখুন..."
            rows={4}
            maxLength={2000}
            className="w-full p-4 rounded-lg border border-[var(--color-border)] bg-white font-bengali-sans text-ink focus:outline-none focus:border-accent resize-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-ink-muted font-bengali-sans">
              {toBengaliNumerals(body.length)}/২০০০
            </span>
            <button
              type="submit"
              disabled={!body.trim() || submitting}
              className="flex items-center gap-2 px-5 py-2 bg-accent text-white rounded-lg font-bengali-sans text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={15} />
              {submitting ? 'পাঠানো হচ্ছে...' : 'মন্তব্য করুন'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-paper-dark rounded-lg border border-[var(--color-border)] text-center">
          <p className="font-bengali-sans text-sm text-ink-muted mb-2">মন্তব্য করতে লগইন করুন।</p>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-bengali-sans font-semibold hover:bg-accent-dark transition-colors"
          >
            লগইন করুন
          </a>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-9 h-9 rounded-full bg-paper-dark shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-paper-dark rounded w-24" />
                <div className="h-3 bg-paper-dark rounded w-full" />
                <div className="h-3 bg-paper-dark rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10">
          <MessageCircle size={36} className="mx-auto text-ink-muted/40 mb-3" />
          <p className="font-bengali-sans text-ink-muted">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </section>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const name = comment.user?.full_name || comment.user?.username || 'অজ্ঞাত পাঠক'
  const initial = name[0]?.toUpperCase()

  return (
    <div className="flex gap-3">
      {comment.user?.avatar_url ? (
        <Image
          src={comment.user.avatar_url}
          alt={name}
          width={36}
          height={36}
          className="rounded-full shrink-0 w-9 h-9 object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center shrink-0 text-sm">
          {initial}
        </div>
      )}
      <div className="flex-1">
        <div className="bg-white border border-[var(--color-border)] rounded-lg px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-sm font-bengali-sans text-ink">{name}</span>
            <span className="text-xs text-ink-muted font-bengali-sans">
              {formatRelativeDate(comment.created_at)}
            </span>
          </div>
          <p className="font-bengali-sans text-sm text-ink-light leading-relaxed whitespace-pre-wrap">
            {comment.body}
          </p>
        </div>
      </div>
    </div>
  )
}
