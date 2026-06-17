'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  data: string
  size?: number
  className?: string
}

export default function QRCodeGenerator({ 
  data, 
  size = 120, 
  className = '' 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#0F766E',
          light: '#FFFFFF'
        }
      })
    }
  }, [data, size])

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      width={size}
      height={size}
    />
  )
}