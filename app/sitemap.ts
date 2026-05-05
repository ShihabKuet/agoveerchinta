import { MetadataRoute } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

// This file auto-generates /sitemap.xml at build time.
// Google uses this to discover and index all your Bengali blog posts.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://agoveerchinta.com'
  const supabase = createSupabaseAdminClient()

  // Fetch all published post slugs
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Fetch all category slugs
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const postUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${base}/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${base}/category/${cat.slug}`,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  return [
    {
      url: base,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${base}/search`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...categoryUrls,
    ...postUrls,
  ]
}
