import type { Metadata } from 'next'
import { Noto_Serif_Bengali, Hind_Siliguri, Playfair_Display } from 'next/font/google'
import './globals.css'

// ---- Bengali Serif — For headings, post titles, body text of literary pieces ----
// Why Noto Serif Bengali? Google's Noto project ensures no missing glyphs.
// Serif gives the editorial newspaper weight we want for headlines.
const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-serif-bengali',
  display: 'swap',   // 'swap' means Bengali text shows immediately in fallback font
})

// ---- Bengali Sans — For UI elements, captions, navigation ----
// Why Hind Siliguri? Optimized for screen readability at small sizes.
const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
})

// ---- Playfair Display — Latin masthead/logo only ----
// Gives the prestigious newspaper masthead feel
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

// ---- Site-wide SEO metadata ----
export const metadata: Metadata = {
  title: {
    default: 'অগভীর চিন্তা',
    template: '%s | অগভীর চিন্তা',  // Each page can set its own title
  },
  description: 'বাংলা ভাষায় সাহিত্য, রাজনীতি, বিজ্ঞান, প্রযুক্তি ও আরও অনেক বিষয়ে লেখার একটি বিশেষ জায়গা।',
  keywords: ['বাংলা ব্লগ', 'সাহিত্য', 'রাজনীতি', 'বিজ্ঞান', 'প্রযুক্তি', 'Bengali blog'],
  authors: [{ name: 'অগভীর চিন্তা' }],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    siteName: 'অগভীর চিন্তা',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="bn"   // HTML lang attribute — crucial for screen readers & SEO
      className={`${notoSerifBengali.variable} ${hindSiliguri.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
