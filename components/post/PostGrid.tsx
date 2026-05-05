import { cn } from '@/lib/utils'
import PostCard from './PostCard'
import type { Post } from '@/types'

interface PostGridProps {
  posts: Post[]
  columns?: 2 | 3 | 4
  showExcerpt?: boolean
  className?: string
}

export default function PostGrid({
  posts,
  columns = 3,
  showExcerpt = false,
  className,
}: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-ink-muted font-bengali-sans text-lg">কোনো লেখা পাওয়া যায়নি।</p>
      </div>
    )
  }

  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns]

  return (
    <div className={cn('grid gap-5', gridClass, className)}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          variant="default"
          showExcerpt={showExcerpt}
        />
      ))}
    </div>
  )
}
