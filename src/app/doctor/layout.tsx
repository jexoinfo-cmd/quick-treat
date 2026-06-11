'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

const navItems = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: '📊' },
  { name: 'Queue Management', href: '/doctor/queue', icon: '⏳' },
  { name: 'Appointments', href: '/doctor/appointments', icon: '📅' },
  { name: 'My Wallet', href: '/doctor/wallet', icon: '💰' },
  { name: 'My Profile', href: '/doctor/profile', icon: '👤' },
]

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, profile } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/assets/icons/logo.png"
                alt="Quick Treat Logo"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
            </div>
            <div>
              <span className="font-bold text-lg">Quick Treat</span>
              <p className="text-xs text-text-grey">Doctor Portal</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isMobile ? 'shadow-xl' : ''}
        `}>
          <div className="p-4 lg:p-6 h-full flex flex-col">
            {/* Logo Section */}
            <div className="flex items-center justify-between lg:justify-start gap-2 mb-8">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image
                    src="/assets/icons/logo.png"
                    alt="Quick Treat Logo"
                    width={32}
                    height={32}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div>
                  <span className="font-bold text-xl">Quick Treat</span>
                  <p className="text-xs text-text-grey">Doctor Portal</p>
                </div>
              </div>
              {isMobile && (
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="mb-6 p-3 bg-teal-light/30 rounded-xl">
              <p className="text-xs sm:text-sm text-text-grey">Welcome back,</p>
              <p className="font-semibold text-sm sm:text-base text-teal-dark truncate">
                Dr. {profile?.name?.split(' ')[0] || 'Rahman'}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-text-grey hover:bg-teal-light/30'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm lg:text-base">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-red-50 transition"
            >
              <span className="text-xl">🚪</span>
              <span className="text-sm lg:text-base">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}