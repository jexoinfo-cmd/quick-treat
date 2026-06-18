// src/app/login/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { AuthError } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // ✅ useCallback - router dependency যোগ করা হয়েছে
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password')
      return
    }

    setIsLoading(true)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast.error('Invalid email or password')
        } else {
          toast.error(error.message)
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_approved')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          toast.error('Error fetching user profile')
          setIsLoading(false)
          return
        }

        toast.success('Login successful!')

        if (profile?.role === 'doctor') {
          router.push(profile?.is_approved ? '/doctor/dashboard' : '/doctor/pending-approval')
        } else if (profile?.role === 'hospital') {
          router.push(profile?.is_approved ? '/hospital/dashboard' : '/hospital/pending-approval')
        } else if (profile?.role === 'patient') {
          router.push('/patient/dashboard')
        } else {
          router.push('/')
        }
      }
    } catch (error: unknown) {
      const authError = error as AuthError
      toast.error(authError.message || 'Login failed')
      setIsLoading(false)
    }
  }, [formData.email, formData.password, router]) // ✅ router dependency যোগ করা হয়েছে

  // ✅ হ্যান্ডেল চেঞ্জ - useCallback
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  return (
    // ✅ bg-gradient-to-b থেকে bg-linear-to-b তে পরিবর্তন করা হয়েছে
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white flex flex-col">
      {/* Header - optimized */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <Image
                src="/assets/icons/logo.png"
                alt="Quick Treat Logo"
                width={48}
                height={48}
                className="rounded-xl object-cover"
                priority
                sizes="(max-width: 640px) 40px, 48px"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl sm:text-2xl text-teal-dark">Quick Treat</span>
              <p className="text-xs text-text-grey">Smart Digital Queue & Patient Management System</p>
            </div>
            <span className="block sm:hidden font-bold text-lg text-teal-dark">Quick Treat</span>
          </Link>
          <div className="flex gap-2 sm:gap-4">
            <Link 
              href="/patient-register" 
              className="bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base hover:bg-primary-dark transition-colors active:scale-95"
            >
              Register
            </Link>
            <Link 
              href="/" 
              className="text-text-grey hover:text-text-dark text-sm sm:text-base transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Icon & Title */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl" role="img" aria-label="lock">🔐</span>
                </div>
                <h1 className="text-2xl font-bold text-teal-dark">Welcome Back!</h1>
                <p className="text-text-grey text-sm mt-2">Login to your account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-2.5 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-grey hover:text-text-dark transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link 
                    href="/forgot-password"
                    className="text-primary text-sm hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* Register Links */}
              <div className="mt-6 space-y-4">
                <p className="text-center text-text-grey text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/patient-register" className="text-primary hover:underline font-medium transition-colors">
                    Register here
                  </Link>
                </p>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-text-grey">or</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    href="/desk-register"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary-light transition-colors active:scale-[0.98]"
                  >
                    <span className="text-xl">🖥️</span>
                    Desk Registration (Doctor / Hospital)
                  </Link>
                  <p className="text-xs text-text-grey mt-2">
                    Register as a doctor or hospital to start managing patients
                  </p>
                </div>
              </div>

              {/* ✅ Demo Credentials - সম্পূর্ণ রিমুভ করা হয়েছে */}

              {/* Footer Text */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-xs text-text-grey">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - optimized */}
      <footer className="bg-teal-dark text-white mt-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto text-center text-white/60 text-sm">
            © 2026 Quick Treat. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}