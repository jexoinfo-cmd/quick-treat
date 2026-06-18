// src/app/patient/invoice/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { generateInvoiceHTML, InvoiceData } from '@/lib/invoice/invoiceTemplate'
import InvoiceDownload from '@/components/invoice/InvoiceDownload'
import QRCodeGenerator from '@/components/qr/QRCodeGenerator'
import toast from 'react-hot-toast'

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params?.id as string
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        router.push('/patient/dashboard')
        return
      }

      try {
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
          router.push('/patient/dashboard')
          return
        }

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

  if (!invoiceData) {
    return (
      <div className="text-center py-12">
        <p className="text-text-grey">Invoice not found</p>
        <button
          onClick={() => router.push('/patient/dashboard')}
          className="mt-4 text-primary hover:underline"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  const qrData = JSON.stringify({
    invoice: invoiceData.invoiceNumber,
    appointment: invoiceData.appointmentId,
    patient: invoiceData.patientName,
    doctor: invoiceData.doctorName,
    date: invoiceData.appointmentDate,
    time: invoiceData.appointmentTime,
    amount: invoiceData.totalAmount
  })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text-dark">Invoice</h1>
          <InvoiceDownload 
            invoiceId={invoiceData.invoiceNumber}
            onDownload={() => console.log('Downloaded')}
            onPrint={() => console.log('Printed')}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div 
            id="invoice"
            className="p-8"
            dangerouslySetInnerHTML={{ 
              __html: generateInvoiceHTML(invoiceData) 
            }}
          />
        </div>

        <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Booking QR Code</h3>
          <div className="flex flex-col items-center">
            <QRCodeGenerator data={qrData} size={150} />
            <p className="text-sm text-text-grey mt-4">
              Scan this QR code to view booking details
            </p>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            #invoice, #invoice * { visibility: visible; }
            #invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  )
}