import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Clock, Tag, Grid3X3, BookOpen } from 'lucide-react'
import { getPopularPosts, getRecentPosts } from '@/lib/db/posts'
import { getAllCategories, getTagsWithCounts } from '@/lib/db/categories'
import { formatRelativeDate, toBengaliNumerals } from '@/lib/utils'

export default async function Sidebar() {
  // All data fetched in parallel for performance
  const [popularPosts, recentPosts, categories, tags] = await Promise.all([
    getPopularPosts(5),
    getRecentPosts(5),
    getAllCategories(),
    getTagsWithCounts(20),
  ])

  return (
    <aside className="w-full space-y-0">

      {/* ---- POPULAR POSTS ---- */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header">
          <TrendingUp size={14} className="text-accent" />
          <h3>জনপ্রিয় লেখা</h3>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {popularPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/${post.slug}`}
              className="flex gap-3 px-4 py-3 hover:bg-paper-dark transition-colors group"
            >
              {/* Number badge */}
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-ink)] text-white text-xs font-bold flex items-center justify-center font-bengali-sans mt-0.5">
                {toBengaliNumerals(index + 1)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-bengali-serif text-ink group-hover:text-accent transition-colors leading-snug line-clamp-2">
                  {post.title}
                </p>
                <p className="text-xs text-ink-muted mt-1 font-bengali-sans">
                  {toBengaliNumerals(post.view_count)} বার পড়া হয়েছে
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ---- RECENT POSTS ---- */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header">
          <Clock size={14} className="text-accent" />
          <h3>সাম্প্রতিক লেখা</h3>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/${post.slug}`}
              className="flex gap-3 px-4 py-3 hover:bg-paper-dark transition-colors group"
            >
              {/* Thumbnail */}
              {post.feature_image_url ? (
                <div className="shrink-0 w-16 h-12 rounded overflow-hidden relative">
                  <Image
                    src={post.feature_image_url}
                    alt={post.feature_image_alt || post.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-16 h-12 rounded bg-paper-dark flex items-center justify-center">
                  <BookOpen size={18} className="text-ink-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-bengali-serif text-ink group-hover:text-accent transition-colors leading-snug line-clamp-2">
                  {post.title}
                </p>
                {post.published_at && (
                  <p className="text-xs text-ink-muted mt-1 font-bengali-sans">
                    {formatRelativeDate(post.published_at)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ---- CATEGORIES ---- */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header">
          <Grid3X3 size={14} className="text-accent" />
          <h3>বিভাগসমূহ</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-2 p-2 rounded border border-[var(--color-border)] hover:border-accent hover:bg-paper-dark transition-all group"
            >
              {cat.icon && (
                <span className="text-base">{cat.icon}</span>
              )}
              <span className="text-sm font-semibold font-bengali-sans text-ink group-hover:text-accent transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ---- TAGS ---- */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header">
          <Tag size={14} className="text-accent" />
          <h3>ট্যাগসমূহ</h3>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bengali-sans font-medium bg-paper-dark text-ink hover:bg-accent hover:text-white transition-all border border-[var(--color-border)] hover:border-accent"
            >
              #{tag.name}
              <span className="opacity-60">({toBengaliNumerals(tag.post_count)})</span>
            </Link>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-ink-muted font-bengali-sans">কোনো ট্যাগ নেই।</p>
          )}
        </div>
      </div>

      {/* ---- LITERATURE TYPES QUICK LINKS ---- */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header">
          <BookOpen size={14} className="text-accent" />
          <h3>সম্পর্কিত বিষয়</h3>
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: '📜 কবিতা',    href: '/category/kobita',     desc: 'ছন্দে বাঁধা কথা' },
            { label: '📖 গল্প',      href: '/category/golpo',      desc: 'ছোট গল্প সংকলন' },
            { label: '📚 বই রিভিউ', href: '/category/boi-review', desc: 'বইয়ের পর্যালোচনা' },
            { label: '⬇️ ডাউনলোড',  href: '/downloads',           desc: 'বিনামূল্যে ডাউনলোড' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-2.5 rounded hover:bg-paper-dark transition-colors group border border-transparent hover:border-[var(--color-border)]"
            >
              <div>
                <p className="text-sm font-semibold font-bengali-sans text-ink group-hover:text-accent transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-ink-muted">{item.desc}</p>
              </div>
              <span className="text-ink-muted group-hover:text-accent transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
