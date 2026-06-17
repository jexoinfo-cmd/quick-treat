import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function useInvoice() {
  const [loading, setLoading] = useState(false)

  const generateInvoice = async (appointmentId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!patient_id(name, email, phone),
          doctor:doctors(
            speciality,
            profile:profiles!user_id(name)
          )
        `)
        .eq('id', appointmentId)
        .single()

      if (error) throw error

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${appointmentId.slice(0, 6)}`

      // Save invoice to database
      const { error: saveError } = await supabase
        .from('invoices')
        .insert({
          appointment_id: appointmentId,
          invoice_number: invoiceNumber,
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          amount: data.fee,
          status: 'paid',
          generated_at: new Date().toISOString()
        })

      if (saveError) throw saveError

      return { invoiceNumber, data }
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast.error('Failed to generate invoice')
      return null
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = async (invoiceNumber: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/invoice/${invoiceNumber}`)
      if (!response.ok) throw new Error('Failed to download')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceNumber}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Invoice downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download invoice')
    } finally {
      setLoading(false)
    }
  }

  return { generateInvoice, downloadInvoice, loading }
}