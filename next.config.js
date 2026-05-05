/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Supabase Storage CDN and common external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
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
