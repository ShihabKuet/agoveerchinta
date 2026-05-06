'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Edit3, Trash2, Plus } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { formatBengaliDate, toBengaliNumerals, POST_TYPE_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Post } from '@/types'

export default function ManagePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => { loadPosts() }, [filter])

  async function loadPosts() {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, category:categories(name, color, slug), author:profiles!author_id(username, full_name)')
      .order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setPosts((data as Post[]) || [])
    setLoading(false)
  }

  async function deletePost(id: string) {
    if (!confirm('এই লেখাটি মুছে ফেলবেন? এটি পুনরুদ্ধার করা যাবে না।')) return
    setDeleting(id)
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  async function toggleStatus(post: Post) {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const updates: Partial<Post> = {
      status: newStatus,
      ...(newStatus === 'published' && !post.published_at ? { published_at: new Date().toISOString() } : {}),
    }
    await supabase.from('posts').update(updates).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...updates } : p))
  }

  return (
    <div className="px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bengali-serif text-2xl font-bold text-ink">সব লেখা</h1>
        <Link href="/admin/editor" className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-bengali-sans text-sm font-semibold hover:bg-accent-dark transition-colors">
          <Plus size={16} />নতুন লেখা
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {([['all', 'সব'], ['published', 'প্রকাশিত'], ['draft', 'খসড়া']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} className={cn('px-4 py-1.5 rounded-full text-sm font-bengali-sans font-medium transition-colors', filter === val ? 'bg-ink text-white' : 'bg-paper-dark text-ink-muted hover:text-ink border border-[var(--color-border)]')}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-paper-dark rounded-lg animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16"><p className="font-bengali-sans text-ink-muted">কোনো লেখা নেই।</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-paper-dark border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider">শিরোনাম</th>
                <th className="text-left px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider hidden md:table-cell">বিভাগ</th>
                <th className="text-left px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider hidden lg:table-cell">তারিখ</th>
                <th className="text-center px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider hidden lg:table-cell">পাঠক</th>
                <th className="text-left px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider">অবস্থা</th>
                <th className="px-4 py-3 font-bengali-sans font-semibold text-ink-muted text-xs uppercase tracking-wider text-right">কাজ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-paper-dark/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bengali-serif font-semibold text-ink line-clamp-1">{post.title}</p>
                    <p className="text-xs text-ink-muted font-bengali-sans mt-0.5">
                      {POST_TYPE_LABELS[post.post_type]}
                      {post.is_featured && ' · ⭐'}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {post.category ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bengali-sans font-semibold text-white" style={{ backgroundColor: post.category.color }}>
                        {post.category.name}
                      </span>
                    ) : <span className="text-ink-muted text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs font-bengali-sans text-ink-muted">
                      {post.published_at ? formatBengaliDate(post.published_at) : formatBengaliDate(post.created_at)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className="text-xs font-bengali-sans text-ink-muted">{toBengaliNumerals(post.view_count)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(post)}
                      className={cn('px-2.5 py-1 rounded-full text-xs font-bengali-sans font-semibold transition-colors', post.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-amber-100 text-amber-700 hover:bg-green-100 hover:text-green-700')}
                    >
                      {post.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/${post.slug}`} target="_blank" className="p-1.5 rounded text-ink-muted hover:text-accent hover:bg-paper-dark transition-colors" title="দেখুন">
                        <Eye size={15} />
                      </Link>
                      <Link href={`/admin/editor/${post.id}`} className="p-1.5 rounded text-ink-muted hover:text-blue-500 hover:bg-blue-50 transition-colors" title="সম্পাদনা">
                        <Edit3 size={15} />
                      </Link>
                      <button onClick={() => deletePost(post.id)} disabled={deleting === post.id} className="p-1.5 rounded text-ink-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50" title="মুছুন">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
