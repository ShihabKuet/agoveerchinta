import Link from 'next/link'
import { PenSquare, FileText, Home, Grid3X3 } from 'lucide-react'
import LogoutButton from '@/components/admin/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper flex">

      {/* Sidebar */}
      <nav className="w-16 md:w-56 bg-[var(--color-ink)] text-white flex flex-col shrink-0">

        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <Link href="/">
            <p className="font-bengali-serif text-white font-bold text-sm hidden md:block leading-tight">
              আগোভীর<br />চিন্তা
            </p>
            <p className="font-bengali-serif text-white font-bold text-lg md:hidden">আ</p>
          </Link>
        </div>

        {/* Nav links */}
        <div className="flex-1 p-3 space-y-1">
          {[
            { label: 'ড্যাশবোর্ড', href: '/admin',            icon: Home },
            { label: 'নতুন লেখা',  href: '/admin/editor',      icon: PenSquare },
            { label: 'সব লেখা',    href: '/admin/manage',      icon: FileText },
            { label: 'বিভাগসমূহ',  href: '/admin/categories',  icon: Grid3X3 },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon size={18} className="shrink-0" />
              <span className="font-bengali-sans text-sm hidden md:block">{label}</span>
            </Link>
          ))}
        </div>

        {/* Bottom: site link + logout */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Home size={18} className="shrink-0" />
            <span className="font-bengali-sans text-sm hidden md:block">সাইটে যান</span>
          </Link>
          <LogoutButton />
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
