import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://agoveerchinta.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],  // Don't index admin or API routes
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
