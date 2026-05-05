import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Metadata } from 'next'
import { getPostBySlug, getRelatedPosts } from '@/lib/db/posts'
import { formatBengaliDate, readingTimeLabel, absoluteUrl, POST_TYPE_LABELS } from '@/lib/utils'
import PostCard from '@/components/post/PostCard'
import LikeButton from '@/components/interactions/LikeButton'
import ShareButtons from '@/components/interactions/ShareButtons'
import CommentSection from '@/components/interactions/CommentSection'
import ViewTracker from '@/components/interactions/ViewTracker'
import { Eye, Clock, Tag } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: { slug: string }
}

// Generate dynamic metadata for SEO — each post gets its own OG tags
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
      images: post.feature_image_url ? [{ url: post.feature_image_url }] : undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)

  if (!post) notFound()

  // Fetch related posts in parallel
  const relatedPosts = post.category_id
    ? await getRelatedPosts(post.id, post.category_id, 3)
    : []

  const postUrl = absoluteUrl(`/${post.slug}`)

  return (
    <article className="max-w-content">

      {/* ---- View tracker (client component, silent) ---- */}
      <ViewTracker postId={post.id} />

      {/* ---- Breadcrumb ---- */}
      <nav className="flex items-center gap-2 text-xs text-ink-muted font-bengali-sans mb-4">
        <Link href="/" className="hover:text-accent transition-colors">হোম</Link>
        {post.category && (
          <>
            <span>›</span>
            <Link href={`/category/${post.category.slug}`} className="hover:text-accent transition-colors">
              {post.category.name}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-ink line-clamp-1">{post.title}</span>
      </nav>

      {/* ---- Post type badge ---- */}
      {post.post_type !== 'article' && (
        <div className="mb-3">
          <span className="category-badge bg-ink text-white text-xs">
            {POST_TYPE_LABELS[post.post_type]}
          </span>
        </div>
      )}

      {/* ---- Category ---- */}
      {post.category && (
        <Link href={`/category/${post.category.slug}`}>
          <span
            className="category-badge text-white text-xs mb-3 inline-block"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.name}
          </span>
        </Link>
      )}

      {/* ---- Title ---- */}
      <h1 className="font-bengali-serif text-3xl md:text-4xl font-extrabold leading-tight text-ink mb-4">
        {post.title}
      </h1>

      {/* ---- Excerpt ---- */}
      {post.excerpt && (
        <p className="font-bengali-sans text-lg text-ink-muted leading-relaxed mb-5 border-l-4 border-accent pl-4">
          {post.excerpt}
        </p>
      )}

      {/* ---- Post meta bar ---- */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4 border-y border-[var(--color-border)] mb-6 text-sm text-ink-muted font-bengali-sans">
        {/* Author */}
        {post.author && (
          <div className="flex items-center gap-2">
            {post.author.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={post.author.full_name || post.author.username}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                {(post.author.full_name || post.author.username)?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-ink font-semibold leading-none">
                {post.author.full_name || post.author.username}
              </p>
              {post.published_at && (
                <p className="text-xs mt-0.5">{formatBengaliDate(post.published_at)}</p>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 ml-auto">
          <span className="flex items-center gap-1.5">
            <Eye size={14} />
            {post.view_count} পাঠক
          </span>
          {post.reading_time_min && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {readingTimeLabel(post.reading_time_min)}
            </span>
          )}
        </div>
      </div>

      {/* ---- Feature Image ---- */}
      {post.feature_image_url && (
        <figure className="mb-8">
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-paper-dark">
            <Image
              src={post.feature_image_url}
              alt={post.feature_image_alt || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 760px"
              priority
            />
          </div>
          {post.feature_image_alt && (
            <figcaption className="text-xs text-center text-ink-muted mt-2 font-bengali-sans">
              {post.feature_image_alt}
            </figcaption>
          )}
        </figure>
      )}

      {/* ---- Post Body ---- */}
      {/* The Tiptap JSON is rendered here via a client component */}
      <div
        className="post-body mb-8"
        dangerouslySetInnerHTML={{
          // Tiptap JSON to HTML rendering is done in the API in production
          // For v1.0 we store and display body_text as a placeholder
          __html: post.body_text
            ? post.body_text.replace(/\n/g, '<br/>')
            : '<p class="text-ink-muted">বিষয়বস্তু লোড হচ্ছে...</p>',
        }}
      />

      {/* ---- Tags ---- */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-4 border-t border-[var(--color-border)] mb-4">
          <Tag size={14} className="text-ink-muted shrink-0" />
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="px-3 py-1 rounded-full bg-paper-dark border border-[var(--color-border)] text-sm font-bengali-sans text-ink hover:bg-accent hover:text-white hover:border-accent transition-all"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* ---- Interaction Bar: Like + Share ---- */}
      <div className="flex items-center justify-between py-5 border-y border-[var(--color-border)] mb-8">
        <LikeButton postId={post.id} initialCount={post.like_count || 0} />
        <ShareButtons url={postUrl} title={post.title} />
      </div>

      {/* ---- Comments ---- */}
      <CommentSection postId={post.id} />

      {/* ---- Related Posts ---- */}
      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-[var(--color-border)]">
          <div className="section-heading">
            <h2>সম্পর্কিত লেখা</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedPosts.map((rPost) => (
              <PostCard key={rPost.id} post={rPost} variant="default" />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
