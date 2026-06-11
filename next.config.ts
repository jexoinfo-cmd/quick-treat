import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cqajbjwgunhroaiqmhiv.supabase.co'],
    localPatterns: [
      {
        pathname: '/assets/**',
        search: '',
      },
    ],
  },
  // Remove reactCompiler - it doesn't exist in this version
  // Add transpilePackages if needed
  transpilePackages: ['@supabase/supabase-js'],
  // Configure webpack to handle hydration issues
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  },
}

export default nextConfig