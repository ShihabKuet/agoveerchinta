'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { toBengaliNumerals } from '@/lib/utils'
import { BarChart2, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PollOption {
  id: string
  label: string
  sort_order: number
  vote_count: number
}

interface Poll {
  id: string
  question: string
  is_active: boolean
  options: PollOption[]
  userVotedOptionId: string | null
}

export default function PollWidget({ postId }: { postId: string }) {
  const [poll, setPoll]           = useState<Poll | null>(null)
  const [loading, setLoading]     = useState(true)
  const [voting, setVoting]       = useState(false)
  const [voted, setVoted]         = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    async function fetchPoll() {
      const res = await fetch(`/api/polls?postId=${postId}`)
      const data = await res.json()
      if (data) {
        // Normalize vote counts from Supabase [{count:N}] shape
        const normalized = {
          ...data,
          options: (data.options || []).map((opt: Record<string, unknown>) => ({
            ...opt,
            vote_count: Array.isArray(opt.vote_count)
              ? Number((opt.vote_count as {count: number}[])[0]?.count) || 0
              : Number(opt.vote_count) || 0,
          })),
        }
        setPoll(normalized)
        setVoted(data.userVotedOptionId || null)
      }
      setLoading(false)
    }
    fetchPoll()
  }, [postId])

  async function handleVote(optionId: string) {
    if (voted || voting || !poll?.is_active) return
    setVoting(true)

    const res = await fetch('/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId: poll.id, optionId }),
    })

    if (res.ok) {
      // Optimistically update vote count
      setPoll(prev => prev ? {
        ...prev,
        options: prev.options.map(opt =>
          opt.id === optionId
            ? { ...opt, vote_count: opt.vote_count + 1 }
            : opt
        ),
      } : null)
      setVoted(optionId)
    }
    setVoting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-ink-muted" />
      </div>
    )
  }

  if (!poll) return null

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0)
  const hasVoted   = !!voted

  return (
    <div className="my-8 bg-paper-dark border border-[var(--color-border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-border)] bg-white">
        <BarChart2 size={18} className="text-accent shrink-0" />
        <h3 className="font-bengali-serif font-bold text-base text-ink">{poll.question}</h3>
      </div>

      {/* Options */}
      <div className="p-4 space-y-3">
        {poll.options
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(option => {
            const pct = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0
            const isVoted = voted === option.id

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || !poll.is_active || voting}
                className={cn(
                  'relative w-full text-left rounded-lg overflow-hidden border transition-all duration-200',
                  hasVoted
                    ? 'cursor-default'
                    : 'hover:border-accent hover:shadow-sm cursor-pointer',
                  isVoted
                    ? 'border-accent'
                    : 'border-[var(--color-border)]',
                  'bg-white'
                )}
              >
                {/* Progress bar fill */}
                {hasVoted && (
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 transition-all duration-700 rounded-lg',
                      isVoted ? 'bg-accent/15' : 'bg-paper-dark'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isVoted && <CheckCircle2 size={15} className="text-accent shrink-0" />}
                    <span className={cn(
                      'font-bengali-sans text-sm',
                      isVoted ? 'font-semibold text-accent' : 'text-ink'
                    )}>
                      {option.label}
                    </span>
                  </div>
                  {hasVoted && (
                    <div className="shrink-0 text-right">
                      <span className={cn(
                        'font-bengali-sans text-sm font-bold',
                        isVoted ? 'text-accent' : 'text-ink-muted'
                      )}>
                        {toBengaliNumerals(pct)}%
                      </span>
                      <p className="text-xs text-ink-muted font-bengali-sans">
                        {toBengaliNumerals(option.vote_count)} ভোট
                      </p>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[var(--color-border)] bg-white flex items-center justify-between">
        <span className="text-xs font-bengali-sans text-ink-muted">
          মোট {toBengaliNumerals(totalVotes)} ভোট
        </span>
        {!poll.is_active && (
          <span className="text-xs font-bengali-sans text-ink-muted bg-paper-dark px-2 py-0.5 rounded-full">
            ভোটগ্রহণ শেষ
          </span>
        )}
        {hasVoted && poll.is_active && (
          <span className="text-xs font-bengali-sans text-green-600">
            ✓ আপনার ভোট নথিভুক্ত হয়েছে
          </span>
        )}
      </div>
    </div>
  )
}
