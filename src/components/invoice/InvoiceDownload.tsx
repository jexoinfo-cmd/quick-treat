// src/components/invoice/InvoiceDownload.tsx
'use client'

import { useState } from 'react'
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

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const content = `
        QUICK TREAT - INVOICE
        ====================
        Invoice #: ${invoiceId}
        Date: ${new Date().toLocaleDateString()}
        Total: ৳500.00
        Status: Paid
        ====================
        Thank you for choosing Quick Treat!
      `
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.txt`
      a.click()
      URL.revokeObjectURL(url)
      
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
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2 text-sm"
      >
        {downloading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Downloading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </>
        )}
      </button>

      <button
        onClick={handlePrint}
        disabled={printing}
        className="px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary-light transition disabled:opacity-50 flex items-center gap-2 text-sm"
      >
        {printing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Printing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </>
        )}
      </button>
    </div>
  )
}