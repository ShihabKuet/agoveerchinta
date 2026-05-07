import { Metadata } from 'next'
import Link from 'next/link'
import { PenSquare, FileText, Eye, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ড্যাশবোর্ড — অগভীর চিন্তা',
}

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bengali-serif text-3xl font-bold text-ink">ড্যাশবোর্ড</h1>
          <p className="font-bengali-sans text-ink-muted mt-1">অগভীর চিন্তা — লেখক প্যানেল</p>
        </div>
        <Link
          href="/admin/editor"
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-bengali-sans font-semibold text-sm hover:bg-accent-dark transition-colors"
        >
          <PenSquare size={16} />
          নতুন লেখা
        </Link>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Link
          href="/admin/editor"
          className="p-6 bg-white rounded-xl border border-[var(--color-border)] hover:border-accent hover:shadow-card-hover transition-all group"
        >
          <PenSquare size={28} className="text-accent mb-3" />
          <h3 className="font-bengali-serif text-lg font-bold text-ink group-hover:text-accent">নতুন লেখা</h3>
          <p className="font-bengali-sans text-sm text-ink-muted mt-1">নতুন পোস্ট তৈরি করুন</p>
        </Link>

        <Link
          href="/admin/manage"
          className="p-6 bg-white rounded-xl border border-[var(--color-border)] hover:border-accent hover:shadow-card-hover transition-all group"
        >
          <FileText size={28} className="text-blue-500 mb-3" />
          <h3 className="font-bengali-serif text-lg font-bold text-ink group-hover:text-accent">সব লেখা</h3>
          <p className="font-bengali-sans text-sm text-ink-muted mt-1">লেখা পরিচালনা করুন</p>
        </Link>

        <Link
          href="/"
          className="p-6 bg-white rounded-xl border border-[var(--color-border)] hover:border-accent hover:shadow-card-hover transition-all group"
        >
          <Eye size={28} className="text-green-500 mb-3" />
          <h3 className="font-bengali-serif text-lg font-bold text-ink group-hover:text-accent">সাইট দেখুন</h3>
          <p className="font-bengali-sans text-sm text-ink-muted mt-1">পাবলিক ভিউ খুলুন</p>
        </Link>
      </div>

      {/* Auth notice */}
      <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="font-bengali-sans text-sm text-amber-800">
          <strong>পরবর্তী ধাপে</strong> — Supabase Auth দিয়ে লগইন সিস্টেম যোগ করা হবে।
          এখন সরাসরি Supabase Dashboard থেকে পোস্ট যোগ করুন।
        </p>
      </div>
    </div>
  )
}
