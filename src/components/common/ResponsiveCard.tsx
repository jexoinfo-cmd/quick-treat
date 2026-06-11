'use client'

import { ReactNode } from 'react'

interface ResponsiveCardProps {
  children: ReactNode
  title?: string
  icon?: string
  className?: string
  onClick?: () => void
}

export default function ResponsiveCard({ 
  children, 
  title, 
  icon, 
  className = '',
  onClick 
}: ResponsiveCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl sm:rounded-2xl 
        border border-border 
        p-4 sm:p-5 md:p-6 
        hover:shadow-md transition-all duration-200
        ${onClick ? 'cursor-pointer active:scale-98' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          {icon && <span className="text-xl sm:text-2xl">{icon}</span>}
          <h3 className="font-semibold text-text-dark text-base sm:text-lg">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}