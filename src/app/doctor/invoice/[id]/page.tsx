// src/app/doctor/invoice/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { InvoiceData } from '@/lib/invoice/invoiceTemplate'
import InvoiceViewer from '@/components/invoice/InvoiceViewer'
import toast from 'react-hot-toast'

export default function DoctorInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params?.id as string
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        router.push('/doctor/dashboard')
        return
      }

      try {
        // First check if doctor is logged in
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          toast.error('Please login first')
          router.push('/login')
          return
        }

        // Get doctor profile
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('id, user_id')
          .eq('user_id', session.user.id)
          .single()

        if (doctorError || !doctor) {
          toast.error('Doctor not found')
          router.push('/doctor/dashboard')
          return
        }

        // Fetch appointment with all details
        const { data: appointment, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:profiles!patient_id(name, email, phone),
            doctor:doctors(
              speciality,
              profile:profiles!user_id(name)
            ),
            hospital:hospitals(
              name,
              address
            )
          `)
          .eq('id', invoiceId)
          .single()

        if (error) throw error

        if (!appointment) {
          toast.error('Invoice not found')
          router.push('/doctor/dashboard')
          return
        }

        // Check if this doctor is authorized to view this invoice
        if (appointment.doctor_id !== doctor.id) {
          toast.error('You are not authorized to view this invoice')
          router.push('/doctor/dashboard')
          return
        }

        setIsAuthorized(true)

        // Prepare invoice data
        let paymentStatus: 'paid' | 'pending' | 'failed' = 'pending'
        if (appointment.status === 'confirmed' || appointment.status === 'completed') {
          paymentStatus = 'paid'
        } else if (appointment.status === 'pending_payment') {
          paymentStatus = 'pending'
        } else if (appointment.status === 'cancelled') {
          paymentStatus = 'failed'
        }

        const invoice: InvoiceData = {
          invoiceNumber: `INV-${Date.now()}-${invoiceId.slice(0, 6)}`,
          appointmentId: appointment.id,
          patientName: appointment.patient?.name || 'Unknown',
          patientPhone: appointment.patient?.phone || 'N/A',
          patientEmail: appointment.patient?.email || 'N/A',
          doctorName: appointment.doctor?.profile?.name || 'Unknown',
          doctorSpeciality: appointment.doctor?.speciality || 'General',
          hospitalName: appointment.hospital?.name,
          hospitalAddress: appointment.hospital?.address,
          appointmentDate: new Date(appointment.appointment_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          appointmentTime: appointment.appointment_time,
          consultationFee: appointment.fee || 0,
          platformFee: (appointment.fee || 0) * 0.1,
          totalAmount: appointment.fee || 0,
          paymentMethod: 'Online Payment',
          paymentDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          paymentStatus: paymentStatus,
          transactionId: `TXN-${Date.now()}-${invoiceId.slice(0, 6)}`
        }

        setInvoiceData(invoice)
      } catch (error) {
        console.error('Error fetching invoice:', error)
        toast.error('Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!invoiceData || !isAuthorized) {
    return (
      <div className="text-center py-12">
        <p className="text-text-grey">Invoice not found or unauthorized</p>
        <button
          onClick={() => router.push('/doctor/dashboard')}
          className="mt-4 text-primary hover:underline"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-dark">Invoice Details</h1>
          <p className="text-text-grey text-sm">View and manage invoice for appointment</p>
        </div>

        {/* ✅ role কে সঠিক টাইপে কাস্ট করুন */}
        <InvoiceViewer 
          invoiceData={invoiceData}
          role="doctor"  // ✅ সঠিক টাইপ
          onDownload={() => console.log('Invoice downloaded')}
          onPrint={() => console.log('Invoice printed')}
        />
      </div>
    </div>
  )
}