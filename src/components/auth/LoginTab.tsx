'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

export default function LoginTab({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      
      if (error) throw error
      
      toast.success('Login successful!')
      onClose()
      
      if (authData.user) {
        // First try to get user role from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        // If profile doesn't exist, create it
        if (profileError && profileError.code === 'PGRST116') {
          const userRole = authData.user.user_metadata?.role || 'patient'
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              name: authData.user.user_metadata?.name || data.email.split('@')[0],
              email: data.email,
              phone: authData.user.user_metadata?.phone || '',
              role: userRole,
              is_approved: userRole === 'patient'
            })
          
          if (insertError) {
            console.error('Profile creation error:', insertError)
            toast.error('Error creating user profile')
            router.push('/')
            return
          }
          
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single()
          
          // Redirect based on role
          const newRole = newProfile?.role
          if (newRole === 'doctor') {
            router.push('/doctor/dashboard')
          } else if (newRole === 'hospital') {
            router.push('/hospital/dashboard')
          } else if (newRole === 'patient') {
            router.push('/patient/dashboard')
          } else {
            router.push('/')
          }
          return
        }
        
        if (profileError) {
          console.error('Profile fetch error:', profileError)
          toast.error('Error fetching user role')
          router.push('/')
          return
        }
        
        // Redirect based on role
        const role = profile?.role
        if (role === 'doctor') {
          router.push('/doctor/dashboard')
        } else if (role === 'hospital') {
          router.push('/hospital/dashboard')
        } else if (role === 'patient') {
          router.push('/patient/dashboard')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else {
          toast.error(error.message || 'Login failed')
        }
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Email Address
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
        />
        {errors.email && (
          <p className="text-error text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
        />
        {errors.password && (
          <p className="text-error text-sm mt-1">{errors.password.message}</p>
        )}
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
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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

      {/* Demo Credentials - Remove in production */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-text-dark font-medium mb-2">Demo Credentials:</p>
        <div className="space-y-1 text-xs text-text-grey">
          <p>📧 doctor@example.com / password123</p>
          <p>🏥 hospital@example.com / password123</p>
          <p>👤 patient@example.com / password123</p>
        </div>
        <p className="text-xs text-text-grey mt-2 italic">
          Note: Use these credentials after signing up with the same email
        </p>
      </div>
    </form>
  )
}