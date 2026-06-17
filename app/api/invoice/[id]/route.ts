// /app/api/invoice/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoiceHTML, InvoiceData } from '@/lib/invoice/invoiceTemplate'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ✅ createClient() এখন async, তাই await ব্যবহার করুন
    const supabase = await createClient()
    const { id } = params

    // অ্যাপয়েন্টমেন্ট ডেটা ফেচ করুন
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
      .eq('id', id)
      .single()

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // paymentStatus সঠিক টাইপে কনভার্ট করুন
    let paymentStatus: 'paid' | 'pending' | 'failed' = 'pending'
    
    if (appointment.status === 'confirmed' || appointment.status === 'completed') {
      paymentStatus = 'paid'
    } else if (appointment.status === 'pending_payment') {
      paymentStatus = 'pending'
    } else if (appointment.status === 'cancelled') {
      paymentStatus = 'failed'
    }

    // invoiceData টাইপ সঠিকভাবে সেট করুন
    const invoiceData: InvoiceData = {
      invoiceNumber: `INV-${Date.now()}-${id.slice(0, 6)}`,
      appointmentId: appointment.id,
      patientName: appointment.patient?.name || 'Unknown',
      patientPhone: appointment.patient?.phone || 'N/A',
      patientEmail: appointment.patient?.email || 'N/A',
      doctorName: appointment.doctor?.profile?.name || 'Unknown',
      doctorSpeciality: appointment.doctor?.speciality || 'General',
      hospitalName: appointment.hospital?.name || undefined,
      hospitalAddress: appointment.hospital?.address || undefined,
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
      transactionId: `TXN-${Date.now()}-${id.slice(0, 6)}`
    }

    // HTML জেনারেট করুন
    const html = generateInvoiceHTML(invoiceData)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}