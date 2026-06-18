// src/components/qr/QRCodeGenerator.tsx
'use client'

import { useEffect, useRef } from 'react'

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
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return
      
      ctx.clearRect(0, 0, size, size)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, size, size)
      
      const blockSize = size / 8
      const pattern = [
        [1,1,1,1,1,1,1,0],
        [1,0,0,0,0,0,1,0],
        [1,0,1,1,1,0,1,0],
        [1,0,1,0,1,0,1,0],
        [1,0,1,1,1,0,1,0],
        [1,0,0,0,0,0,1,0],
        [1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0]
      ]
      
      for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
          if (pattern[row][col] === 1) {
            ctx.fillStyle = '#0F766E'
            ctx.fillRect(
              col * blockSize + 4,
              row * blockSize + 4,
              blockSize - 8,
              blockSize - 8
            )
          }
        }
      }
      
      ctx.fillStyle = '#0F766E'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('QR Code', size/2, size - 4)
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