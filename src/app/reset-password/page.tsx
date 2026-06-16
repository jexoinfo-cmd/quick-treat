'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Invalid or expired reset link')
        router.push('/login')
        return
      }

      setChecking(false)
    }

    checkSession()
  }, [router])

  const validatePassword = (value: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

    return regex.test(value)
  }

  const handleResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error('Please fill all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!validatePassword(password)) {
      toast.error(
        'Password must be at least 8 characters and contain uppercase, lowercase and a number'
      )
      return
    }

    try {
      setLoading(true)

      const { error } =
        await supabase.auth.updateUser({
          password,
        })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(
        'Password updated successfully'
      )

      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error) {
      console.error(error)

      toast.error(
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">
          Verifying reset link...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔑</div>

          <h1 className="text-2xl font-bold text-gray-900">
            Reset Password
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            Enter your new password below.
          </p>
        </div>

        <form
          onSubmit={handleResetPassword}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter new password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="text-xs text-gray-500">
            Password must contain:
            <ul className="list-disc ml-5 mt-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Updating Password...'
              : 'Update Password'}
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