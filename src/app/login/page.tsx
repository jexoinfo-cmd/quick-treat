'use client'

import { useState } from 'react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting login for:', formData.email)
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error('Login error:', error)
        if (error.message === 'Invalid login credentials') {
          toast.error('Invalid email or password')
        } else {
          toast.error(error.message)
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log('Login successful, fetching profile...')
        
        // Get user role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_approved')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          toast.error('Error fetching user profile')
          setIsLoading(false)
          return
        }

        toast.success('Login successful!')

        // Redirect based on role
        if (profile?.role === 'doctor') {
          if (profile?.is_approved) {
            router.push('/doctor/dashboard')
          } else {
            router.push('/doctor/pending-approval')
          }
        } else if (profile?.role === 'hospital') {
          if (profile?.is_approved) {
            router.push('/hospital/dashboard')
          } else {
            router.push('/hospital/pending-approval')
          }
        } else if (profile?.role === 'patient') {
          router.push('/patient/dashboard')
        } else {
          router.push('/')
        }
      }
    } catch (error: unknown) {
      console.error('Unexpected error:', error)
      const authError = error as AuthError
      toast.error(authError.message || 'Login failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white flex flex-col">
      {/* Header */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/assets/icons/logo.png"
                alt="Quick Treat Logo"
                width={48}
                height={48}
                className="rounded-xl object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-xl sm:text-2xl text-teal-dark">Quick Treat</span>
              <p className="text-xs text-text-grey hidden sm:block">Smart Digital Queue & Patient Management System</p>
            </div>
          </Link>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/patient-register" className="bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base hover:bg-primary-dark transition">
              Register
            </Link>
            <Link href="/" className="text-text-grey hover:text-text-dark text-sm sm:text-base">
              Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔐</span>
                </div>
                <h1 className="text-2xl font-bold text-teal-dark">Welcome Back!</h1>
                <p className="text-text-grey text-sm mt-2">Login to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-grey hover:text-text-dark"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => toast.error('Please contact support to reset password')}
                    className="text-primary text-sm hover:underline transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* Patient Registration Link */}
              <div className="mt-6 text-center">
                <p className="text-text-grey text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/patient-register" className="text-primary hover:underline font-medium">
                    Register here
                  </Link>
                </p>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-text-grey">or</span>
                </div>
              </div>

              {/* Desk Registration Link */}
              <div className="text-center">
                <Link
                  href="/desk-register"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary-light transition"
                >
                  <span className="text-xl">🖥️</span>
                  Desk Registration (Doctor / Hospital)
                </Link>
                <p className="text-xs text-text-grey mt-2">
                  Register as a doctor or hospital to start managing patients
                </p>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-teal-light/30 rounded-lg">
                <p className="text-sm text-text-dark font-medium mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs text-text-grey">
                  <p>👨‍⚕️ Doctor: doctor@example.com / password123</p>
                  <p>🏥 Hospital: hospital@example.com / password123</p>
                  <p>👤 Patient: patient@example.com / password123</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-xs text-text-grey">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-dark text-white mt-12">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto text-center text-white/60 text-sm">
            © 2026 Quick Treat. All Rights Reserved. Powered by Quick Treat
          </div>
        </div>
      </footer>
    </div>
  )
}