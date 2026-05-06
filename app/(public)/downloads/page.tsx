import { Metadata } from 'next'
import Link from 'next/link'
import { getPosts } from '@/lib/db/posts'
import { formatBengaliDate, toBengaliNumerals } from '@/lib/utils'
import { Download, FileText, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ডাউনলোড — আগোভীর চিন্তা',
  description: 'বিনামূল্যে ডাউনলোডযোগ্য সকল ফাইল ও রচনা।',
}

export const revalidate = 300

export default async function DownloadsPage() {
  const { data: posts, count } = await getPosts({ postType: 'download', pageSize: 50 })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[var(--color-border)]">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Download size={24} className="text-accent" />
        </div>
        <div>
          <h1 className="font-bengali-serif text-3xl font-bold text-ink">ডাউনলোড</h1>
          <p className="font-bengali-sans text-sm text-ink-muted mt-0.5">
            {toBengaliNumerals(count)} টি ফাইল পাওয়া গেছে
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <Download size={40} className="mx-auto text-ink-muted/40 mb-3" />
          <p className="font-bengali-serif text-xl text-ink-muted">কোনো ডাউনলোড নেই।</p>
          <p className="font-bengali-sans text-sm text-ink-muted mt-2">শীঘ্রই যোগ করা হবে।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/${post.slug}`}
              className="flex items-center gap-4 p-4 bg-white border border-[var(--color-border)] rounded-xl hover:border-accent hover:shadow-card-hover transition-all group"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <FileText size={22} className="text-accent" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-bengali-serif font-bold text-base text-ink group-hover:text-accent transition-colors line-clamp-1">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="font-bengali-sans text-sm text-ink-muted mt-0.5 line-clamp-1">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  {post.published_at && (
                    <span className="text-xs font-bengali-sans text-ink-muted">
                      {formatBengaliDate(post.published_at)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-bengali-sans text-ink-muted">
                    <Eye size={11} />
                    {toBengaliNumerals(post.view_count)}
                  </span>
                </div>
              </div>

              {/* Download arrow */}
              <div className="shrink-0 w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
                <Download size={16} className="text-ink-muted group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
