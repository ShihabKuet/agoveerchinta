import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

// ---- Tailwind class merging (used in every component) ----
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---- Bengali date formatting ----
const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল',
  'মে', 'জুন', 'জুলাই', 'আগস্ট',
  'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
]

// "১৫ জুলাই, ২০২৪" — used on post pages
export function formatBengaliDate(dateStr: string): string {
  const date = parseISO(dateStr)
  const day = toBengaliNumerals(date.getDate())
  const month = BENGALI_MONTHS[date.getMonth()]
  const year = toBengaliNumerals(date.getFullYear())
  return `${day} ${month}, ${year}`
}

// "৩ দিন আগে" — used on cards
export function formatRelativeDate(dateStr: string): string {
  const distance = formatDistanceToNow(parseISO(dateStr), { addSuffix: false })
  // Translate common English patterns to Bengali
  return distance
    .replace(/about (\d+) hours?/, (_, n) => `${toBengaliNumerals(n)} ঘণ্টা আগে`)
    .replace(/(\d+) days?/, (_, n) => `${toBengaliNumerals(n)} দিন আগে`)
    .replace(/(\d+) minutes?/, (_, n) => `${toBengaliNumerals(n)} মিনিট আগে`)
    .replace(/(\d+) months?/, (_, n) => `${toBengaliNumerals(n)} মাস আগে`)
    .replace(/(\d+) years?/, (_, n) => `${toBengaliNumerals(n)} বছর আগে`)
    .replace('less than a minute', 'এইমাত্র')
}

// Convert Arabic numerals to Bengali: 2024 → ২০২৪
export function toBengaliNumerals(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(num).replace(/[0-9]/g, d => bengaliDigits[parseInt(d)])
}

// ---- Reading time label ----
export function readingTimeLabel(minutes: number | null): string {
  if (!minutes) return ''
  return `${toBengaliNumerals(minutes)} মিনিটের পড়া`
}

// ---- Truncate text ----
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '...'
}

// ---- Post type labels in Bengali ----
export const POST_TYPE_LABELS: Record<string, string> = {
  article:     'নিবন্ধ',
  poem:        'কবিতা',
  story:       'গল্প',
  novel:       'উপন্যাস',
  book_review: 'বই রিভিউ',
  download:    'ডাউনলোড',
}

// ---- Absolute URL for SEO / sharing ----
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${base}${path}`
}
