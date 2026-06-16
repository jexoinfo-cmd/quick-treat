'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { AuthError } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        router.push('/')
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password')
      return
    }

    try {
      setIsLoading(true)

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
        return
      }

      if (!data.user) {
        toast.error('Login failed')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_approved')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        toast.error('Error fetching user profile')
        return
      }

      toast.success('Login successful!')

      switch (profile?.role) {
        case 'doctor':
          router.push(
            profile.is_approved ? '/doctor/dashboard' : '/doctor/pending-approval'
          )
          break

        case 'hospital':
          router.push(
            profile.is_approved ? '/hospital/dashboard' : '/hospital/pending-approval'
          )
          break

        case 'patient':
          router.push('/patient/dashboard')
          break

        default:
          router.push('/')
      }
    } catch (error: unknown) {
      const authError = error as AuthError

      toast.error(authError.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white flex flex-col">
      <nav className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/assets/icons/logo.png"
                alt="Quick Treat"
                width={48}
                height={48}
                className="rounded-xl object-cover"
                priority
              />
            </div>

            <div>
              <span className="font-bold text-2xl text-teal-dark">Quick Treat</span>

              <p className="text-xs text-text-grey hidden sm:block">
                Smart Digital Queue & Patient Management System
              </p>
            </div>
          </Link>

          <div className="flex gap-4">
            <Link
              href="/patient-register"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              Register
            </Link>

            <Link href="/" className="text-text-grey hover:text-text-dark">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-8">
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link href="/forgot-password" className="text-primary text-sm hover:underline">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-text-grey text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href="/patient-register" className="text-primary hover:underline font-medium">
                    Register here
                  </Link>
                </p>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>

                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-text-grey">or</span>
                </div>
              </div>

              <Link
                href="/desk-register"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary-light transition"
              >
                🖥️ Desk Registration
              </Link>

              <div className="mt-6 p-4 bg-teal-light/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Demo Credentials:</p>

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

      <footer className="bg-teal-dark text-white mt-12">
        <div className="px-4 py-6 text-center text-white/60 text-sm">
          © 2026 Quick Treat. All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}