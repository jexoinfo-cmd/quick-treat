'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      if (data.user) {
        // Get user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_approved')
          .eq('id', data.user.id)
          .single()

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
      const authError = error as AuthError
      toast.error(authError.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white">
      {/* Header */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
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
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/')}
              className="text-text-grey hover:text-text-dark text-sm sm:text-base"
            >
              Home
            </button>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <main className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
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
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => toast.error('Password reset feature coming soon!')}
                    className="text-primary text-sm hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Patient Registration Link */}
              <div className="mt-6 text-center">
                <p className="text-text-grey text-sm">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => router.push('/patient-register')}
                    className="text-primary hover:underline font-medium"
                  >
                    Register here
                  </button>
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
                <button
                  onClick={() => router.push('/desk-register')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary-light transition"
                >
                  <span className="text-xl">🖥️</span>
                  Desk Registration (Doctor / Hospital)
                </button>
                <p className="text-xs text-text-grey mt-2">
                  Register as a doctor or hospital to start managing patients
                </p>
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
            © 2026 Quick Treat. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}