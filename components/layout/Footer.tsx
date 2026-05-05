import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--color-ink)] text-white mt-12">

      {/* ---- Main footer grid ---- */}
      <div className="max-w-site mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* About column */}
          <div className="md:col-span-2">
            <h3 className="font-bengali-serif text-2xl font-bold mb-3 text-white">
              আগোভীর চিন্তা
            </h3>
            <p className="text-sm font-bengali-sans text-white/60 leading-relaxed mb-4">
              বাংলায় লেখার একটি বিশেষ জায়গা। সাহিত্য, রাজনীতি, বিজ্ঞান,
              প্রযুক্তিসহ জীবনের নানা বিষয়ে মুক্ত চিন্তার আড্ডা।
            </p>
            <p className="text-xs text-white/40 font-bengali-sans">
              বাংলায় ভাবি, বাংলায় লিখি
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 font-bengali-sans">
              বিভাগসমূহ
            </h4>
            <ul className="space-y-2">
              {[
                ['সাহিত্য', '/category/sahitya'],
                ['রাজনীতি', '/category/rajneeti'],
                ['বিজ্ঞান', '/category/biggan'],
                ['প্রযুক্তি', '/category/projukti'],
                ['খেলাধুলা', '/category/kheladhula'],
                ['কবিতা', '/category/kobita'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-bengali-sans text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 font-bengali-sans">
              লেখার ধরন
            </h4>
            <ul className="space-y-2">
              {[
                ['কবিতা', '/category/kobita'],
                ['গল্প', '/category/golpo'],
                ['বই রিভিউ', '/category/boi-review'],
                ['ডাউনলোড', '/downloads'],
                ['অনুসন্ধান', '/search'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-bengali-sans text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ---- Bottom bar ---- */}
      <div className="border-t border-white/10">
        <div className="max-w-site mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40 font-bengali-sans">
            © {year} আগোভীর চিন্তা। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex gap-4 text-xs text-white/40 font-bengali-sans">
            <Link href="/about" className="hover:text-white/70 transition-colors">সম্পর্কে</Link>
            <Link href="/contact" className="hover:text-white/70 transition-colors">যোগাযোগ</Link>
            <Link href="/privacy" className="hover:text-white/70 transition-colors">গোপনীয়তা</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
