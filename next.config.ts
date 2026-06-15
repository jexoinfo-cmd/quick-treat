import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cqajbjwgunhroaiqmhiv.supabase.co',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint is configured in eslint.config.mjs, not here
  turbopack: {},
}

export default nextConfig