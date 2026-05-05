'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="বাংলায় অনুসন্ধান করুন..."
        className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-[var(--color-border)] bg-white font-bengali-sans text-ink focus:outline-none focus:border-accent text-sm transition-colors"
        autoFocus
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark transition-colors"
        aria-label="অনুসন্ধান"
      >
        <Search size={16} />
      </button>
    </form>
  )
}
