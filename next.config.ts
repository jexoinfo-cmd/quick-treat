import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cqajbjwgunhroaiqmhiv.supabase.co',
        pathname: '/**',
      },
    ],
  },
  // Empty turbopack config to satisfy the requirement
  turbopack: {},
}

export default nextConfig