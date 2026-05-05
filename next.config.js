/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Supabase Storage CDN and common external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    // Optimizes package imports for faster builds
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
}

module.exports = nextConfig
