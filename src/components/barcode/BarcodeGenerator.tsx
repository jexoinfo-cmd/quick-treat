// src/components/barcode/BarcodeGenerator.tsx
'use client'

import { useEffect, useRef } from 'react'

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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const barWidth = width
      const totalBars = 30
      
      let hash = 0
      for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i)
        hash = hash & hash
      }
      
      const seed = Math.abs(hash)
      
      let x = 20
      ctx.fillStyle = '#111827'
      
      for (let i = 0; i < totalBars; i++) {
        const barValue = ((seed + i * 7) % 10)
        const barHeight = 30 + (barValue % 5) * 4
        const isWide = barValue > 6
        
        ctx.fillRect(x, 10, isWide ? barWidth * 2 : barWidth, barHeight)
        x += isWide ? barWidth * 2 + 2 : barWidth + 2
      }
      
      ctx.fillStyle = '#111827'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(value, canvas.width/2, canvas.height - 4)
    }
  }, [value, width, height])

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      width={300}
      height={height + 20}
    />
  )
}