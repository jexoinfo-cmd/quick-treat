'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    try {
      setLoading(true)

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        )

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(
        'Password reset link sent successfully. Please check your email.'
      )

      setEmail('')
    } catch (error) {
      console.error('Reset password error:', error)

      toast.error(
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>

          <h1 className="text-2xl font-bold text-gray-900">
            Forgot Password
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            Enter your email address and we will send
            you a password reset link.
          </p>
        </div>

        <form
          onSubmit={handleReset}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Sending Reset Link...'
              : 'Send Reset Link'}
          </button>
        </form>

        <button
          onClick={() => router.push('/login')}
          className="w-full mt-4 text-teal-600 hover:underline text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}