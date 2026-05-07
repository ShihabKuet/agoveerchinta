'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

// Navigation categories in Bengali
const NAV_LINKS = [
  { label: 'সাহিত্য',   href: '/category/sahitya' },
  { label: 'রাজনীতি',  href: '/category/rajneeti' },
  { label: 'বিজ্ঞান',   href: '/category/biggan' },
  { label: 'প্রযুক্তি', href: '/category/projukti' },
  { label: 'খেলাধুলা',  href: '/category/kheladhula' },
  { label: 'বিনোদন',   href: '/category/binodon' },
  { label: 'ভ্রমণ',     href: '/category/bhromon' },
  { label: 'কবিতা',    href: '/category/kobita' },
  { label: 'বই রিভিউ', href: '/category/boi-review' },
]

interface HeaderProps {
  breakingNews?: string[]
}

export default function Header({ breakingNews = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Format today's date in Bengali for the masthead
  const today = new Date()
  const bengaliDate = today.toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="w-full bg-paper border-b border-[var(--color-divider)]">

      {/* ---- TOP UTILITY BAR ---- */}
      {/* Small strip above masthead: date on left, links on right */}
      <div className="bg-[var(--color-ink)] text-white text-xs py-1.5">
        <div className="max-w-site mx-auto px-4 flex justify-between items-center">
          <span className="font-bengali-sans opacity-80">{bengaliDate}</span>
          <div className="flex gap-4 font-bengali-sans">
            <Link href="/admin" className="opacity-70 hover:opacity-100 transition-opacity">
              লিখুন
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/search" className="opacity-70 hover:opacity-100 transition-opacity">
              অনুসন্ধান
            </Link>
          </div>
        </div>
      </div>

      {/* ---- MASTHEAD ---- */}
      {/* The big newspaper name — the most important visual element */}
      <div className="max-w-site mx-auto px-4 py-5 text-center border-b border-[var(--color-divider)]">
        <Link href="/" className="inline-block group">
          {/* Ornamental lines above and below the title — classic newspaper style */}
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1 h-px bg-[var(--color-ink)]" />
            <div className="h-0.5 w-4 bg-accent" />
            <div className="flex-1 h-px bg-[var(--color-ink)]" />
          </div>

          <h1
            className="font-bengali-serif text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            অগভীর চিন্তা
          </h1>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-px bg-[var(--color-ink)]" />
            <p className="text-xs font-bengali-sans text-ink-muted italic tracking-widest uppercase px-2">
              ইহা আমার অবিকাশিত চিন্তার বহিঃপ্রকাশ মাত্র 
            </p>
            <div className="flex-1 h-px bg-[var(--color-ink)]" />
          </div>
        </Link>
      </div>

      {/* ---- NAVIGATION BAR ---- */}
      <nav className="bg-[var(--color-ink)] text-white">
        <div className="max-w-site mx-auto px-4">

          {/* Desktop nav */}
          <div className="hidden md:flex items-center justify-between">
            <ul className="flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block px-3 py-3 text-sm font-semibold font-bengali-sans',
                      'text-white/80 hover:text-white hover:bg-accent/80',
                      'border-r border-white/10 transition-colors duration-150'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Search icon on right */}
            <Link
              href="/search"
              className="p-3 text-white/80 hover:text-white transition-colors"
              aria-label="অনুসন্ধান"
            >
              <Search size={18} />
            </Link>
          </div>

          {/* Mobile nav toggle */}
          <div className="md:hidden flex items-center justify-between py-2">
            <span className="font-bengali-sans text-sm font-semibold text-white">বিভাগ</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-white"
              aria-label="মেনু"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 pb-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2.5 text-sm font-bengali-sans text-white/80 hover:text-white hover:bg-accent/80 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ---- BREAKING NEWS TICKER ---- */}
      {/* Only shows if breaking news posts exist */}
      {breakingNews.length > 0 && (
        <div className="bg-accent text-white text-sm flex items-center overflow-hidden">
          <div className="shrink-0 bg-[var(--color-ink)] px-4 py-2 font-bold font-bengali-sans z-10 text-xs uppercase tracking-widest">
            ব্রেকিং
          </div>
          <div className="flex-1 overflow-hidden py-2 px-4">
            <div className="ticker-content">
              {breakingNews.join('  ◆  ')}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
