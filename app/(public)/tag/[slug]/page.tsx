import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import PostGrid from '@/components/post/PostGrid'
import { toBengaliNumerals } from '@/lib/utils'
import type { Post, Tag } from '@/types'

interface Props {
  params: { slug: string }
}

async function getTagWithPosts(slug: string): Promise<{ tag: Tag; posts: Post[] } | null> {
  const supabase = await createSupabaseServerClient()

  // Fetch the tag first
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tag) return null

  // Fetch posts with this tag via the junction table
  const { data: postTags } = await supabase
    .from('post_tags')
    .select(`
      post:posts(
        *,
        category:categories(*),
        author:profiles(id, username, full_name, avatar_url),
        like_count:likes(count),
        comment_count:comments(count)
      )
    `)
    .eq('tag_id', tag.id)
    .limit(24)

  const posts = (postTags || [])
    .map((pt: Record<string, unknown>) => pt.post)
    .filter((p): p is Post => !!p && (p as Post).status === 'published')

  return { tag: tag as Tag, posts }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getTagWithPosts(params.slug)
  if (!result) return {}
  return {
    title: `#${result.tag.name} — অগভীর চিন্তা`,
    description: `"${result.tag.name}" ট্যাগের সকল লেখা।`,
  }
}

export default async function TagPage({ params }: Props) {
  const result = await getTagWithPosts(params.slug)
  if (!result) notFound()

  const { tag, posts } = result

  return (
    <div>
      {/* Tag header */}
      <div className="mb-8 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span className="text-3xl text-ink-muted">#</span>
          <div>
            <h1 className="font-bengali-serif text-3xl font-bold text-ink">{tag.name}</h1>
            <p className="font-bengali-sans text-sm text-ink-muted mt-1">
              {toBengaliNumerals(posts.length)} টি লেখা পাওয়া গেছে
            </p>
          </div>
        </div>
      </div>

      <PostGrid posts={posts} columns={3} showExcerpt />
    </div>
  )
}
