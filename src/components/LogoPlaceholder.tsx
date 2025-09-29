'use client'

import { Flag } from 'lucide-react'

interface LogoPlaceholderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'icon' | 'text' | 'full'
  className?: string
}

export default function LogoPlaceholder({
  size = 'md',
  variant = 'full',
  className = ''
}: LogoPlaceholderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }

  if (variant === 'icon') {
    return (
      <Flag
        className={`${sizeClasses[size]} text-white ${className}`}
        strokeWidth={2}
      />
    )
  }

  if (variant === 'text') {
    return (
      <span className={`${textSizeClasses[size]} font-bold text-white ${className}`}>
        ShotMate
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Flag
        className={`${sizeClasses[size]} text-white`}
        strokeWidth={2}
      />
      <span className={`${textSizeClasses[size]} font-bold text-white`}>
        ShotMate
      </span>
    </div>
  )
}