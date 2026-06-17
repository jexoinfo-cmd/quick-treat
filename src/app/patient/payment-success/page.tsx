'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appointmentId = searchParams.get('appointment_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateAppointment = async () => {
      if (!appointmentId) {
        router.push('/patient/dashboard')
        return
      }

      try {
        // Update appointment status
        const { error } = await supabase
          .from('appointments')
          .update({ 
            status: 'confirmed',
            payment_status: 'paid'
          })
          .eq('id', appointmentId)

        if (error) throw error

        // Create earnings record
        const { data: appointment } = await supabase
          .from('appointments')
          .select('doctor_id, hospital_id, fee, patient_id')
          .eq('id', appointmentId)
          .single()

        if (appointment) {
          // Platform fee (10%)
          const platformFee = appointment.fee * 0.1
          const hospitalAmount = appointment.fee * 0.9

          // Insert earnings for doctor/hospital
          await supabase.from('earnings').insert({
            appointment_id: appointmentId,
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            hospital_id: appointment.hospital_id,
            amount: appointment.fee,
            hospital_amount: hospitalAmount,
            platform_fee: platformFee,
            status: 'completed'
          })

          // Update doctor wallet
          await supabase.rpc('update_doctor_wallet', {
            p_doctor_id: appointment.doctor_id,
            p_amount: hospitalAmount
          })

          // Update hospital wallet
          await supabase.rpc('update_hospital_wallet', {
            p_hospital_id: appointment.hospital_id,
            p_amount: hospitalAmount
          })
        }

        toast.success('Payment successful!')
        
        // Redirect to invoice
        router.push(`/patient/invoice/${appointmentId}`)
      } catch (error) {
        console.error('Error processing payment:', error)
        toast.error('Failed to process payment')
      } finally {
        setLoading(false)
      }
    }

    updateAppointment()
  }, [appointmentId, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return null
}