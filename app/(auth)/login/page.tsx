'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Masthead */}
        <div className="text-center mb-8">
          <h1 className="font-bengali-serif text-4xl font-extrabold text-ink mb-1">
            অগভীর চিন্তা
          </h1>
          <div className="h-px bg-[var(--color-divider)] my-3" />
          <p className="font-bengali-sans text-sm text-ink-muted">
            লেখক প্যানেলে প্রবেশ করুন
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white border border-[var(--color-border)] rounded-xl p-6 space-y-4">

          <div>
            <label className="block text-xs font-semibold font-bengali-sans text-ink-muted mb-1.5 uppercase tracking-wider">
              ইমেইল
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-paper font-bengali-sans text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold font-bengali-sans text-ink-muted mb-1.5 uppercase tracking-wider">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-paper font-bengali-sans text-sm text-ink focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-bengali-sans bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent text-white font-bengali-sans font-semibold text-sm rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted font-bengali-sans mt-6">
          শুধুমাত্র অনুমোদিত লেখকদের জন্য
        </p>
      </div>
    </div>
  )
}
