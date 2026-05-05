import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryBySlug } from '@/lib/db/categories'
import { getPosts } from '@/lib/db/posts'
import PostGrid from '@/components/post/PostGrid'
import { toBengaliNumerals } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  params: { name: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.name)
  if (!category) return {}
  return {
    title: `${category.name} — আগোভীর চিন্তা`,
    description: `${category.name} বিভাগের সকল লেখা পড়ুন।`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug(params.name)
  if (!category) notFound()

  const page = parseInt(searchParams.page || '1', 10)
  const PAGE_SIZE = 12

  const { data: posts, count, totalPages } = await getPosts({
    categorySlug: params.name,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <div>
      {/* Category header */}
      <div
        className="rounded-xl p-6 mb-8 text-white"
        style={{ background: `linear-gradient(135deg, ${category.color}dd, ${category.color}88)` }}
      >
        <div className="flex items-center gap-3">
          {category.icon && <span className="text-4xl">{category.icon}</span>}
          <div>
            <h1 className="font-bengali-serif text-3xl font-bold">{category.name}</h1>
            <p className="font-bengali-sans text-white/80 text-sm mt-1">
              মোট {toBengaliNumerals(count)} টি লেখা
            </p>
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <PostGrid posts={posts} columns={3} showExcerpt />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          {page > 1 && (
            <Link
              href={`/category/${params.name}?page=${page - 1}`}
              className="flex items-center gap-1 px-4 py-2 rounded border border-[var(--color-border)] text-sm font-bengali-sans hover:border-accent hover:text-accent transition-colors"
            >
              <ChevronLeft size={16} /> আগের পাতা
            </Link>
          )}

          <span className="text-sm font-bengali-sans text-ink-muted">
            {toBengaliNumerals(page)} / {toBengaliNumerals(totalPages)}
          </span>

          {page < totalPages && (
            <Link
              href={`/category/${params.name}?page=${page + 1}`}
              className="flex items-center gap-1 px-4 py-2 rounded border border-[var(--color-border)] text-sm font-bengali-sans hover:border-accent hover:text-accent transition-colors"
            >
              পরের পাতা <ChevronRight size={16} />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
