'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/useAuthStore'
import toast from 'react-hot-toast'

interface Payment {
  id: string
  amount: number
  payment_method: string
  transaction_id: string
  status: string
  created_at: string
  appointment: {
    appointment_date: string
    doctor: {
      profile: {
        name: string
      }
    }
  }
}

export default function PaymentHistory() {
  const { profile } = useAuthStore()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch payments - without useCallback
  useEffect(() => {
    const fetchPayments = async () => {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            appointment:appointments(
              appointment_date,
              doctor:doctors(
                profile:profiles(name)
              )
            )
          `)
          .eq('patient_id', profile.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setPayments(data || [])
      } catch (error) {
        console.error('Error fetching payments:', error)
        toast.error('Failed to load payment history')
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [profile?.id])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-dark mb-8">Payment History</h1>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">
                    {payment.appointment?.doctor?.profile?.name || 'Unknown Doctor'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <p className="text-text-grey text-sm">
                  Date: {new Date(payment.appointment?.appointment_date).toLocaleDateString()}
                </p>
                <p className="text-text-grey text-sm">
                  Transaction ID: {payment.transaction_id || 'N/A'}
                </p>
                <p className="text-text-grey text-sm">
                  Payment Method: {payment.payment_method || 'Online'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">৳{payment.amount}</p>
                <p className="text-xs text-text-grey mt-1">
                  {new Date(payment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <p className="text-text-grey">No payment history found</p>
          </div>
        )}
      </div>
    </div>
  )
}