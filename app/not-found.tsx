import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Large ornamental 404 */}
        <div className="font-bengali-serif text-8xl md:text-9xl font-extrabold text-[var(--color-border)] leading-none mb-6 select-none">
          ৪০৪
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[var(--color-divider)]" />
          <div className="w-2 h-2 rounded-full bg-accent" />
          <div className="flex-1 h-px bg-[var(--color-divider)]" />
        </div>

        <h1 className="font-bengali-serif text-2xl font-bold text-ink mb-3">
          পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="font-bengali-sans text-ink-muted mb-8 leading-relaxed">
          আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি হয়তো সরানো হয়েছে,
          নামবদল করা হয়েছে অথবা আর পাওয়া যাচ্ছে না।
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-bengali-sans font-semibold text-sm hover:bg-accent-dark transition-colors"
          >
            <Home size={16} />
            হোম পেজে যান
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--color-border)] bg-white text-ink rounded-lg font-bengali-sans font-semibold text-sm hover:border-accent hover:text-accent transition-colors"
          >
            <Search size={16} />
            অনুসন্ধান করুন
          </Link>
        </div>
      </div>
    </div>
  )
}
