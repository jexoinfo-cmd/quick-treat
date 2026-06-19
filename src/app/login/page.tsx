// src/app/login/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { AuthError } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

// 🔥 Profile error type
interface ProfileError {
  code: string
  message: string
  details?: string
  hint?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

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
        console.log('✅ User logged in:', data.user.id)
        
        // Get user profile
        let profileData = null
        let profileError: ProfileError | null = null

        try {
          const result = await supabase
            .from('profiles')
            .select('role, is_approved')
            .eq('id', data.user.id)
            .single()
          
          profileData = result.data
          profileError = result.error as ProfileError | null
        } catch (err) {
          console.error('Profile fetch error:', err)
          profileError = { code: 'unknown', message: String(err) }
        }

        // 🔥 If profile doesn't exist, create one
        if (profileError && profileError.code === 'PGRST116') {
          console.log('🔄 Profile not found, creating...')
          
          const userRole = data.user.user_metadata?.role || 'patient'
          const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: userName,
              email: data.user.email,
              role: userRole,
              is_approved: userRole === 'patient' ? true : false
            })

          if (insertError) {
            console.error('❌ Profile creation error:', insertError)
            toast.error('Error creating profile. Please contact support.')
            setIsLoading(false)
            return
          }

          console.log('✅ Profile created successfully')
          
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('role, is_approved')
            .eq('id', data.user.id)
            .single()

          if (newProfile) {
            toast.success('Login successful!')
            
            // Redirect based on role
            if (newProfile.role === 'doctor') {
              router.push('/doctor/dashboard')
            } else if (newProfile.role === 'hospital') {
              router.push('/hospital/dashboard')
            } else if (newProfile.role === 'patient') {
              router.push('/patient/dashboard')
            } else {
              router.push('/')
            }
            setIsLoading(false)
            return
          }
        }

        // Handle profile fetch error (other than not found)
        if (profileError) {
          console.error('❌ Profile fetch error:', profileError)
          toast.error('Error fetching profile')
          setIsLoading(false)
          return
        }

        // Profile found successfully
        if (profileData) {
          console.log('✅ Profile found:', profileData)
          toast.success('Login successful!')

          // Redirect based on role
          if (profileData.role === 'doctor') {
            if (profileData.is_approved) {
              router.push('/doctor/dashboard')
            } else {
              router.push('/doctor/pending-approval')
            }
          } else if (profileData.role === 'hospital') {
            if (profileData.is_approved) {
              router.push('/hospital/dashboard')
            } else {
              router.push('/hospital/pending-approval')
            }
          } else if (profileData.role === 'patient') {
            router.push('/patient/dashboard')
          } else {
            router.push('/')
          }
        } else {
          // No profile data but no error - should not happen
          toast.error('Profile not found. Please contact support.')
          setIsLoading(false)
          return
        }
      }
    } catch (error: unknown) {
      console.error('❌ Unexpected error:', error)
      const authError = error as AuthError
      toast.error(authError.message || 'Login failed')
      setIsLoading(false)
    }
  }, [formData.email, formData.password, router])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <Image
              src="/assets/icons/logo.png"
              alt="Quick Treat"
              width={48}
              height={48}
              className="rounded-xl object-cover"
              priority
            />
            <span className="font-bold text-2xl text-teal-dark">Quick Treat</span>
          </Link>
          <p className="text-text-grey text-sm mt-2">Healthcare Made Easy</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Welcome */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-teal-dark">Welcome Back 👋</h1>
              <p className="text-text-grey text-sm mt-1">Login to your Quick Treat account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
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
                    className="w-full px-4 py-2.5 pr-12 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition text-base sm:text-sm"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                  />
                  <span className="text-sm text-text-grey">Remember Me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Login →'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-text-grey">or continue with</span>
              </div>
            </div>

            {/* Security Message */}
            <div className="mt-6 p-4 bg-teal-light/30 rounded-lg text-center">
              <p className="text-sm text-text-dark font-medium">Your Health, Our Priority</p>
              <p className="text-xs text-text-grey mt-1">We keep your data safe and secure with top-notch protection.</p>
            </div>

            {/* Create Account Link */}
            <div className="mt-6 text-center">
              <p className="text-text-grey text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/patient-register" className="text-primary hover:underline font-medium">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-grey text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}