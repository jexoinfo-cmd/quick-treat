'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface SignupForm {
  name: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
}

export default function SignupTab({ defaultRole, onClose }: { defaultRole: string; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>()

  const onSubmit = async (data: SignupForm) => {
    // Password match validation
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (data.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: defaultRole,
          }
        }
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: data.name,
              email: data.email,
              phone: data.phone || null,
              role: defaultRole,
            }
          ])

        if (profileError) throw profileError

        toast.success('Account created successfully! Please verify your email.')
        onClose()
        
        // Redirect to home page
        router.push('/')
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Signup failed')
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
        <input
          type="text"
          placeholder="Full Name"
          {...register('name', { 
            required: 'Name is required',
            minLength: {
              value: 3,
              message: 'Name must be at least 3 characters'
            }
          })}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email address"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <input
          type="tel"
          placeholder="Phone (Optional)"
          {...register('phone', {
            pattern: {
              value: /^[0-9+\-\s()]*$/,
              message: 'Invalid phone number'
            }
          })}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          {...register('password', { 
            required: 'Password is required', 
            minLength: { 
              value: 6, 
              message: 'Password must be at least 6 characters' 
            }
          })}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          {...register('confirmPassword', { 
            required: 'Please confirm your password'
          })}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.confirmPassword && <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <div className="bg-primary-light p-3 rounded-lg">
        <p className="text-sm text-text-dark">
          You are signing up as: <span className="font-semibold text-primary">{defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)}</span>
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>

      <p className="text-center text-text-grey text-sm">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}