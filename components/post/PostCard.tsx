import Link from 'next/link'
import Image from 'next/image'
import { Eye, Heart, MessageCircle, Clock } from 'lucide-react'
import { cn, formatRelativeDate, readingTimeLabel, toBengaliNumerals, POST_TYPE_LABELS } from '@/lib/utils'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  variant?: 'default' | 'compact' | 'horizontal' | 'featured'
  className?: string
  showExcerpt?: boolean
}

export default function PostCard({
  post,
  variant = 'default',
  className,
  showExcerpt = false,
}: PostCardProps) {

  // ---- FEATURED variant — large hero card ----
  if (variant === 'featured') {
    return (
      <article className={cn('relative group overflow-hidden rounded-lg', className)}>
        <Link href={`/${post.slug}`}>
          {/* Feature image with gradient overlay */}
          <div className="relative aspect-[16/9] bg-paper-dark">
            {post.feature_image_url ? (
              <Image
                src={post.feature_image_url}
                alt={post.feature_image_alt || post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-ink to-ink-light flex items-center justify-center">
                <span className="text-6xl opacity-20">আ</span>
              </div>
            )}
            {/* Dark gradient overlay so text is always readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content overlaid on image */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              {/* Category badge */}
              {post.category && (
                <span
                  className="category-badge text-white mb-3 inline-block"
                  style={{ backgroundColor: post.category.color }}
                >
                  {post.category.name}
                </span>
              )}

              <h2 className="font-bengali-serif text-white font-bold text-xl md:text-2xl leading-snug mb-2 group-hover:text-white/90 transition-colors">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="text-white/70 text-sm font-bengali-sans line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
              )}

              <PostMeta post={post} light />
            </div>
          </div>
        </Link>
      </article>
    )
  }

  // ---- HORIZONTAL variant — image left, text right ----
  if (variant === 'horizontal') {
    return (
      <article className={cn('post-card flex gap-4 group', className)}>
        <Link href={`/${post.slug}`} className="shrink-0 w-28 h-20 md:w-36 md:h-24 rounded overflow-hidden relative bg-paper-dark">
          {post.feature_image_url ? (
            <Image
              src={post.feature_image_url}
              alt={post.feature_image_alt || post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="144px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-paper-dark to-divider flex items-center justify-center">
              <span className="text-2xl opacity-40">আ</span>
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0 py-1">
          {post.category && (
            <span
              className="category-badge text-white text-[10px] mb-1.5 inline-block"
              style={{ backgroundColor: post.category.color }}
            >
              {post.category.name}
            </span>
          )}
          <Link href={`/${post.slug}`}>
            <h3 className="post-card-title font-bengali-serif font-bold text-sm md:text-base leading-snug line-clamp-2 text-ink transition-colors">
              {post.title}
            </h3>
          </Link>
          <div className="mt-1.5">
            <PostMeta post={post} compact />
          </div>
        </div>
      </article>
    )
  }

  // ---- COMPACT variant — text only, no image ----
  if (variant === 'compact') {
    return (
      <article className={cn('post-card group border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0', className)}>
        {post.category && (
          <span
            className="category-badge text-white text-[10px] mb-1 inline-block"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.name}
          </span>
        )}
        <Link href={`/${post.slug}`}>
          <h3 className="post-card-title font-bengali-serif font-semibold text-sm leading-snug line-clamp-2 text-ink transition-colors">
            {post.title}
          </h3>
        </Link>
        {post.published_at && (
          <p className="text-xs text-ink-muted mt-1 font-bengali-sans">
            {formatRelativeDate(post.published_at)}
          </p>
        )}
      </article>
    )
  }

  // ---- DEFAULT variant — vertical card with image on top ----
  return (
    <article className={cn('post-card group bg-white rounded-lg overflow-hidden border border-[var(--color-border)] flex flex-col', className)}>
      {/* Thumbnail */}
      <Link href={`/${post.slug}`} className="relative block aspect-[16/10] bg-paper-dark overflow-hidden">
        {post.feature_image_url ? (
          <Image
            src={post.feature_image_url}
            alt={post.feature_image_alt || post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-paper-dark to-[var(--color-divider)] flex items-center justify-center">
            <span className="text-4xl opacity-30">আ</span>
          </div>
        )}
        {/* Post type badge — top left */}
        {post.post_type !== 'article' && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bengali-sans font-semibold px-2 py-0.5 rounded">
            {POST_TYPE_LABELS[post.post_type]}
          </span>
        )}
      </Link>

      {/* Card body */}
      <div className="flex-1 p-4 flex flex-col">
        {post.category && (
          <Link href={`/category/${post.category.slug}`}>
            <span
              className="category-badge text-white text-[10px] mb-2 inline-block"
              style={{ backgroundColor: post.category.color }}
            >
              {post.category.name}
            </span>
          </Link>
        )}

        <Link href={`/${post.slug}`} className="flex-1">
          <h3 className="post-card-title font-bengali-serif font-bold text-base leading-snug mb-2 text-ink transition-colors line-clamp-2">
            {post.title}
          </h3>
          {showExcerpt && post.excerpt && (
            <p className="text-sm text-ink-muted font-bengali-sans line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}
        </Link>

        <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  )
}

// ---- Sub-component: Post metadata (author, date, stats) ----
function PostMeta({ post, light = false, compact = false }: { post: Post; light?: boolean; compact?: boolean }) {
  const textClass = light ? 'text-white/70' : 'text-ink-muted'
  const iconClass = light ? 'text-white/50' : 'text-ink-muted'

  return (
    <div className={cn('flex items-center justify-between gap-2 font-bengali-sans', compact ? 'text-[11px]' : 'text-xs', textClass)}>
      <div className="flex items-center gap-2 min-w-0">
        {post.author && (
          <span className="font-semibold truncate">
            {post.author.full_name || post.author.username}
          </span>
        )}
        {post.published_at && (
          <>
            <span className="opacity-40">·</span>
            <span className="shrink-0">{formatRelativeDate(post.published_at)}</span>
          </>
        )}
        {post.reading_time_min && !compact && (
          <>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={10} className={iconClass} />
              {readingTimeLabel(post.reading_time_min)}
            </span>
          </>
        )}
      </div>

      {!compact && (
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex items-center gap-1">
            <Eye size={11} className={iconClass} />
            {toBengaliNumerals(post.view_count)}
          </span>
          {post.like_count !== undefined && (
            <span className="flex items-center gap-1">
              <Heart size={11} className={iconClass} />
              {toBengaliNumerals(post.like_count)}
            </span>
          )}
          {post.comment_count !== undefined && (
            <span className="flex items-center gap-1">
              <MessageCircle size={11} className={iconClass} />
              {toBengaliNumerals(post.comment_count)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
