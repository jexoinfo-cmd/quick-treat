'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'

export default function DoctorPendingApproval() {
  const router = useRouter()
  const { user } = useAuthStore()  // profile সরানো হয়েছে, শুধু user রাখা হয়েছে
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!user) {
        router.push('/')
        return
      }

      // Check if doctor is approved
      const { data: doctor } = await supabase
        .from('doctors')
        .select('is_approved')
        .eq('user_id', user.id)
        .single()

      if (doctor?.is_approved === true) {
        router.push('/doctor/dashboard')
      }
      
      setChecking(false)
    }

    checkApprovalStatus()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('doctor-approval')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'doctors',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.new.is_approved === true) {
            router.push('/doctor/dashboard')
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-grey">Checking approval status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⏳</span>
        </div>
        
        <h1 className="text-2xl font-bold text-text-dark mb-3">Pending Approval</h1>
        
        <p className="text-text-grey mb-6">
          Your registration has been submitted successfully. Please wait for admin approval.
          You will be notified once your account is approved.
        </p>
        
        <div className="bg-primary-light rounded-xl p-4 mb-6">
          <p className="text-sm text-text-dark">
            <span className="font-semibold">📝 What happens next?</span><br />
            1. Admin will review your credentials<br />
            2. You will receive an email notification<br />
            3. After approval, you can access your dashboard
          </p>
        </div>
        
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:underline"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}