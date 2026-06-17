'use client'

import { useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

interface InvoiceDownloadProps {
  invoiceId: string
  onDownload?: () => void
  onPrint?: () => void
}

export default function InvoiceDownload({ 
  invoiceId,
  onDownload,
  onPrint 
}: InvoiceDownloadProps) {
  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice')
    if (!element) {
      toast.error('Invoice not found')
      return
    }

    setDownloading(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: true,
        useCORS: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`invoice-${invoiceId}.pdf`)

      if (onDownload) onDownload()
      toast.success('Invoice downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download invoice')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    setPrinting(true)
    try {
      window.print()
      if (onPrint) onPrint()
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Failed to print invoice')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3 no-print">
      <button
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2"
      >
        {downloading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Downloading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </>
        )}
      </button>

      <button
        onClick={handlePrint}
        disabled={printing}
        className="px-6 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary-light transition disabled:opacity-50 flex items-center gap-2"
      >
        {printing ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Printing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </>
        )}
      </button>

      {/* POS Print Option */}
      <button
        onClick={() => {
          // Connect to POS printer via WebUSB or ESC/POS
          toast.success('Connecting to POS printer...')
          // Implement POS printing logic
        }}
        className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        POS Print
      </button>
    </div>
  )
}