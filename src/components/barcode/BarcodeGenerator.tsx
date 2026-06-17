'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeGeneratorProps {
  value: string
  width?: number
  height?: number
  className?: string
}

export default function BarcodeGenerator({ 
  value, 
  width = 2,
  height = 60,
  className = '' 
}: BarcodeGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width: width,
          height: height,
          displayValue: true,
          fontSize: 14,
          font: 'monospace',
          textMargin: 4,
          background: '#ffffff',
          lineColor: '#111827'
        })
      } catch (error) {
        console.error('Barcode generation error:', error)
      }
    }
  }, [value, width, height])

  return (
    <svg 
      ref={svgRef} 
      className={className}
    />
  )
}