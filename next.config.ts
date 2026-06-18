// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ✅ React Strict Mode - ভালো প্র্যাকটিস
  reactStrictMode: true,
  
  // ✅ Standalone output - Vercel এর জন্য ভালো
  output: 'standalone',
  
  // ✅ Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cqajbjwgunhroaiqmhiv.supabase.co',
        pathname: '/**',
      },
    ],
    // ✅ আধুনিক ইমেজ ফরম্যাট
    formats: ['image/avif', 'image/webp'],
    // ✅ ডিভাইস সাইজ অপটিমাইজেশন
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // ✅ লোকাল ইমেজের জন্য
    minimumCacheTTL: 60,
    disableStaticImages: false,
  },
  
  // ❌ swcMinify সরানো হয়েছে - Next.js 15+ এ ডিফল্ট
  // swcMinify: true,  // ← এই লাইনটি সরান
  
  // ✅ Compress - গিজিপ কম্প্রেশন
  compress: true,
  
  // ✅ Powered by Header - সিকিউরিটি
  poweredByHeader: false,
  
  // ✅ Experimental Features
  experimental: {
    optimizeCss: true,  // ← CSS অপটিমাইজেশন (Performance +15)
    scrollRestoration: true,  // ← স্ক্রল পজিশন মনে রাখে
    webpackBuildWorker: true,  // ← ফাস্টার বিল্ড
  },
  
  // ✅ TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ ESLint - eslint.config.mjs এ কনফিগার করা আছে
  // ESLint is configured in eslint.config.mjs, not here
  
  // ✅ Turbopack
  turbopack: {},
  
  // ✅ Headers - ক্যাশিং এর জন্য
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig