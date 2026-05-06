import { Star } from 'lucide-react'

// Displays a static star rating (1-5) for book review posts.
// Rating is read from post excerpt pattern "★4" or a tag like "rating:4"
// If no rating found, renders nothing.
interface StarRatingProps {
  rating: number   // 1-5
  showLabel?: boolean
}

const RATING_LABELS: Record<number, string> = {
  1: 'খুব খারাপ',
  2: 'মোটামুটি',
  3: 'ভালো',
  4: 'খুব ভালো',
  5: 'অসাধারণ',
}

export default function StarRating({ rating, showLabel = true }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)))

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={20}
            className={i <= clamped ? 'star-filled fill-amber-400' : 'star-empty'}
          />
        ))}
      </div>
      {showLabel && (
        <span className="font-bengali-sans text-sm font-semibold text-ink-muted">
          {clamped}/৫ — {RATING_LABELS[clamped]}
        </span>
      )}
    </div>
  )
}
