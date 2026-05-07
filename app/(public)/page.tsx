import Link from 'next/link'
import { Metadata } from 'next'
import { getFeaturedPosts, getRecentPosts, getPosts } from '@/lib/db/posts'
import { getAllCategories } from '@/lib/db/categories'
import PostCard from '@/components/post/PostCard'
import PostGrid from '@/components/post/PostGrid'

export const metadata: Metadata = {
  title: 'অগভীর চিন্তা — বাংলা ব্লগ',
  description: 'সাহিত্য, রাজনীতি, বিজ্ঞান, প্রযুক্তি ও জীবনের নানা বিষয়ে বাংলায় লেখা।',
}

// This page is a Server Component — data fetching happens here, no loading spinners
// Revalidate every 5 minutes so new posts appear without full redeploy
export const revalidate = 300

export default async function HomePage() {
  // Fetch all needed data in parallel
  const [featuredPosts, recentPosts, categories, latestPosts] = await Promise.all([
    getFeaturedPosts(5),
    getRecentPosts(6),
    getAllCategories(),
    getPosts({ page: 1, pageSize: 9 }),
  ])

  const heroPosts = featuredPosts.length > 0 ? featuredPosts : recentPosts
  const [heroPost, ...secondaryPosts] = heroPosts

  return (
    <div className="space-y-8">

      {/* ============================================================
          HERO SECTION — Featured post takes full width + 2 smaller ones
          ============================================================ */}
      {heroPost && (
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

            {/* Main hero — spans 2 columns */}
            <div className="md:col-span-2">
              <PostCard post={heroPost} variant="featured" />
            </div>

            {/* Secondary featured posts — stacked in 1 column */}
            <div className="flex flex-col gap-4">
              {secondaryPosts.slice(0, 2).map((post) => (
                <PostCard key={post.id} post={post} variant="featured" className="flex-1" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          CATEGORY QUICK-ACCESS TABS
          ============================================================ */}
      <section>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[var(--color-border)] bg-white hover:border-accent hover:bg-accent hover:text-white transition-all text-sm font-bengali-sans font-medium text-ink group"
            >
              {cat.icon && <span className="text-base">{cat.icon}</span>}
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          LATEST POSTS — Newspaper-style divider heading
          ============================================================ */}
      <section>
        <div className="section-heading">
          <h2>সর্বশেষ লেখা</h2>
        </div>
        <PostGrid posts={latestPosts.data} columns={3} showExcerpt />
      </section>

      {/* ============================================================
          HORIZONTAL STRIP — Latest 5 from each major category
          Only show categories that have posts
          ============================================================ */}
      {categories.map((category) => (
        <CategorySection key={category.id} categorySlug={category.slug} categoryName={category.name} color={category.color} />
      ))}

    </div>
  )
}

// ---- Async sub-component: fetches posts for one category ----
// Each renders independently — if one fails, others still show
async function CategorySection({
  categorySlug,
  categoryName,
  color,
}: {
  categorySlug: string
  categoryName: string
  color: string
}) {
  const { data: posts } = await getPosts({ categorySlug, pageSize: 4 })

  if (posts.length === 0) return null

  return (
    <section>
      {/* Section header with colored accent */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: color }} />
          <h2 className="text-xl font-bold font-bengali-serif">{categoryName}</h2>
        </div>
        <Link
          href={`/category/${categorySlug}`}
          className="text-sm font-bengali-sans text-ink-muted hover:text-accent transition-colors"
        >
          আরও দেখুন →
        </Link>
      </div>

      {/* First post horizontal, rest compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {posts[0] && (
          <PostCard post={posts[0]} variant="default" showExcerpt className="md:row-span-2" />
        )}
        <div className="space-y-3">
          {posts.slice(1).map((post) => (
            <PostCard key={post.id} post={post} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  )
}
