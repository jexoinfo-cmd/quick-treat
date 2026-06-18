// src/components/invoice/InvoiceViewer.tsx
'use client'

import { useState } from 'react'
import { InvoiceData, generateInvoiceHTML } from '@/lib/invoice/invoiceTemplate'
import InvoiceDownload from './InvoiceDownload'
import InvoicePrint from './InvoicePrint'
import QRCodeGenerator from '@/components/qr/QRCodeGenerator'
import BarcodeGenerator from '@/components/barcode/BarcodeGenerator'

export interface InvoiceViewerProps {
  invoiceData: InvoiceData
  role: 'doctor' | 'hospital' | 'patient'
  onDownload?: () => void
  onPrint?: () => void
}

export default function InvoiceViewer({ 
  invoiceData, 
  role,
  onDownload,
  onPrint 
}: InvoiceViewerProps) {
  const [showQR, setShowQR] = useState(true)

  const qrData = JSON.stringify({
    invoice: invoiceData.invoiceNumber,
    appointment: invoiceData.appointmentId,
    patient: invoiceData.patientName,
    doctor: invoiceData.doctorName,
    hospital: invoiceData.hospitalName,
    date: invoiceData.appointmentDate,
    time: invoiceData.appointmentTime,
    amount: invoiceData.totalAmount
  })

  return (
    <div className="space-y-6">
      {/* Actions - ডাক্তার ও হাসপাতালের জন্য */}
      {(role === 'doctor' || role === 'hospital') && (
        <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-2 text-sm text-text-grey">
            <span className="font-medium text-text-dark">
              {role === 'doctor' ? '👨‍⚕️ Doctor' : '🏥 Hospital'} Invoice
            </span>
            <span className="px-2 py-1 bg-primary-light text-primary rounded-full text-xs font-medium">
              #{invoiceData.invoiceNumber}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <InvoiceDownload 
              invoiceId={invoiceData.invoiceNumber}
              onDownload={onDownload}
            />
            <InvoicePrint 
              onPrint={onPrint}
            />
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-3 py-2 border border-border rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-1"
            >
              {showQR ? 'Hide' : 'Show'} QR
            </button>
          </div>
        </div>
      )}

      {/* Invoice Display */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div 
          id="invoice"
          className="p-8"
          dangerouslySetInnerHTML={{ 
            __html: generateInvoiceHTML(invoiceData, role) 
          }}
        />
      </div>

      {/* QR & Barcode Section - শুধু ডাক্তার/হাসপাতালের জন্য */}
      {(role === 'doctor' || role === 'hospital') && showQR && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-border">
            <h3 className="text-lg font-semibold mb-4 text-center text-text-dark">
              📱 Booking QR Code
            </h3>
            <div className="flex flex-col items-center">
              <QRCodeGenerator data={qrData} size={150} />
              <p className="text-sm text-text-grey mt-3">
                Scan to verify booking
              </p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-border">
            <h3 className="text-lg font-semibold mb-4 text-center text-text-dark">
              📊 Invoice Barcode
            </h3>
            <div className="flex flex-col items-center">
              <BarcodeGenerator 
                value={invoiceData.invoiceNumber}
                width={2}
                height={60}
                // ✅ max-w-[250px] থেকে max-w-62.5 এ পরিবর্তন করা হলো
                className="w-full max-w-62.5"
              />
              <p className="text-sm text-text-grey mt-3">
                Invoice #{invoiceData.invoiceNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Patient View - শুধু পড়ার অনুমতি */}
      {role === 'patient' && (
        <div className="bg-gray-50 rounded-xl p-4 border border-border text-center">
          <p className="text-sm text-text-grey">
            📄 This invoice is for your reference. 
            Please contact the doctor/hospital for any queries.
          </p>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice, #invoice * {
            visibility: visible;
          }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}