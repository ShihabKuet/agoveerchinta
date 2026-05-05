import { Metadata } from 'next'
import { searchPosts } from '@/lib/db/posts'
import PostCard from '@/components/post/PostCard'
import SearchBar from '@/components/ui/SearchBar'
import { toBengaliNumerals } from '@/lib/utils'
import { Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'অনুসন্ধান — আগোভীর চিন্তা',
}

interface Props {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || ''
  const results = query.length >= 2 ? await searchPosts(query) : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-bengali-serif text-2xl font-bold mb-4">অনুসন্ধান</h1>
        <SearchBar defaultValue={query} />
      </div>

      {query && (
        <p className="text-sm text-ink-muted font-bengali-sans mb-6">
          &ldquo;{query}&rdquo; এর জন্য {toBengaliNumerals(results.length)} টি ফলাফল
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {results.map((post) => (
            <PostCard key={post.id} post={post} variant="horizontal" />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-ink-muted mb-4" />
          <p className="font-bengali-serif text-xl text-ink-muted">কোনো ফলাফল পাওয়া যায়নি।</p>
          <p className="font-bengali-sans text-sm text-ink-muted mt-2">অন্য কোনো শব্দ দিয়ে চেষ্টা করুন।</p>
        </div>
      ) : (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-ink-muted mb-4" />
          <p className="font-bengali-serif text-xl text-ink-muted">কী খুঁজছেন?</p>
          <p className="font-bengali-sans text-sm text-ink-muted mt-2">উপরের বাক্সে লিখুন।</p>
        </div>
      )}
    </div>
  )
}
