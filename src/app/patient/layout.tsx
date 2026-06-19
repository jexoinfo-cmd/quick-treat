'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

const navItems = [
  { name: 'Home', href: '/patient/dashboard', icon: '🏠' },
  { name: 'Find Doctors', href: '/patient/doctors', icon: '🔍' },
  { name: 'Appointments', href: '/patient/appointments', icon: '📅' },
  { name: 'Profile', href: '/patient/profile', icon: '👤' },
]

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, profile } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border lg:hidden">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                pathname === item.href
                  ? 'text-primary'
                  : 'text-text-grey'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border">
          <div className="p-6">
            {/* Logo Section */}
            <div className="flex items-center gap-2 mb-8">
              <div className="relative w-8 h-8">
                <Image
                  src="/assets/icons/logo.png"
                  alt="Quick Treat Logo"
                  width={32}
                  height={32}
                  className="rounded-lg object-cover"
                />
              </div>
              <span className="font-bold text-xl text-teal-dark">Quick Treat</span>
            </div>

            {/* User Info */}
            <div className="mb-6 p-3 bg-teal-light/30 rounded-xl">
              <p className="text-xs text-text-grey">Patient Portal</p>
              <p className="font-semibold text-sm text-teal-dark truncate">
                {profile?.name?.split(' ')[0] || 'Welcome Back!'}
              </p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-text-grey hover:bg-teal-light/30'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-red-50 transition"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="ml-64 flex-1">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden pb-20">
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Mobile Menu (Hamburger) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
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
                  <span className="font-bold text-teal-dark">Quick Treat</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-3">
                <p className="font-medium text-teal-dark">{profile?.name || 'Patient'}</p>
                <p className="text-xs text-text-grey">{profile?.email}</p>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-text-grey hover:bg-teal-light/30'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-red-50 transition"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}