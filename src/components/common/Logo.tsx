// src/components/common/Logo.tsx - ✅ আরও কাস্টমাইজযোগ্য ভার্সন
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'small' | 'default' | 'large' | 'custom'
  width?: number
  height?: number
  showText?: boolean
  text?: string
  href?: string
  className?: string
  imageClassName?: string
  textClassName?: string
}

export const Logo = ({ 
  size = 'default',
  width,
  height,
  showText = true,
  text = 'Quick Treat',
  href = '/',
  className = '',
  imageClassName = '',
  textClassName = ''
}: LogoProps) => {
  const sizes = {
    small: { width: 28, height: 28, textSize: 'text-base' },
    default: { width: 40, height: 40, textSize: 'text-xl' },
    large: { width: 52, height: 52, textSize: 'text-2xl' },
    custom: { width: width || 40, height: height || 40, textSize: 'text-xl' },
  }
  
  const s = sizes[size === 'custom' ? 'custom' : size] || sizes.default
  const finalWidth = width || s.width
  const finalHeight = height || s.height
  
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/assets/icons/logo.png"
        alt="Quick Treat"
        width={finalWidth}
        height={finalHeight}
        className={`rounded-xl object-cover ${imageClassName}`}
        priority
      />
      {showText && (
        <span className={`font-bold ${s.textSize} text-teal-dark ${textClassName}`}>
          {text}
        </span>
      )}
    </div>
  )
  
  if (href) {
    return <Link href={href}>{content}</Link>
  }
  
  return content
}

export default Logo