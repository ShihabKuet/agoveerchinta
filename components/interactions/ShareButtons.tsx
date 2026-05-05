'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, Link2, Check } from 'lucide-react'

interface ShareButtonsProps {
  url: string
  title: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shares = [
    {
      label: 'Facebook',
      icon: <Facebook size={16} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600 hover:border-blue-600 hover:text-white',
    },
    {
      label: 'Twitter',
      icon: <Twitter size={16} />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-sky-500 hover:border-sky-500 hover:text-white',
    },
  ]

  return (
    <div className="flex items-center gap-2">
      <Share2 size={15} className="text-ink-muted" />
      <span className="text-sm font-bengali-sans text-ink-muted mr-1">শেয়ার:</span>

      {shares.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-full border border-[var(--color-border)] text-ink-muted transition-all duration-200 ${s.color}`}
          aria-label={`${s.label}-এ শেয়ার করুন`}
        >
          {s.icon}
        </a>
      ))}

      {/* Copy link button */}
      <button
        onClick={copyLink}
        className={`p-2 rounded-full border transition-all duration-200 ${
          copied
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-[var(--color-border)] text-ink-muted hover:bg-ink hover:border-ink hover:text-white'
        }`}
        aria-label="লিংক কপি করুন"
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  )
}
