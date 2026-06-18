// src/components/invoice/InvoicePrint.tsx
'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface InvoicePrintProps {
  onPrint?: () => void
}

export default function InvoicePrint({ onPrint }: InvoicePrintProps) {
  const [printing, setPrinting] = useState(false)

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
  )
}