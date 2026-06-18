// src/hooks/useInvoice.ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { InvoiceData } from '@/lib/invoice/invoiceTemplate'

export function useInvoice() {
  const [loading, setLoading] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)

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

      let paymentStatus: 'paid' | 'pending' | 'failed' = 'pending'
      if (data.status === 'confirmed' || data.status === 'completed') {
        paymentStatus = 'paid'
      } else if (data.status === 'pending_payment') {
        paymentStatus = 'pending'
      } else if (data.status === 'cancelled') {
        paymentStatus = 'failed'
      }

      const invoice: InvoiceData = {
        invoiceNumber: `INV-${Date.now()}-${appointmentId.slice(0, 6)}`,
        appointmentId: data.id,
        patientName: data.patient?.name || 'Unknown',
        patientPhone: data.patient?.phone || 'N/A',
        patientEmail: data.patient?.email || 'N/A',
        doctorName: data.doctor?.profile?.name || 'Unknown',
        doctorSpeciality: data.doctor?.speciality || 'General',
        appointmentDate: new Date(data.appointment_date).toLocaleDateString(),
        appointmentTime: data.appointment_time,
        consultationFee: data.fee || 0,
        platformFee: (data.fee || 0) * 0.1,
        totalAmount: data.fee || 0,
        paymentMethod: 'Online Payment',
        paymentDate: new Date().toLocaleDateString(),
        paymentStatus: paymentStatus,
        transactionId: `TXN-${Date.now()}-${appointmentId.slice(0, 6)}`
      }

      setInvoiceData(invoice)
      return invoice
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

  return { generateInvoice, downloadInvoice, invoiceData, loading }
}