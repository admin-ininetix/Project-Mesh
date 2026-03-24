import { HTMLAttributes } from 'react'
import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const sizePx = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

export function Avatar({ src, alt, size = 'md', className, ...props }: AvatarProps) {
  const initials = getInitials(alt)
  const px = sizePx[size]

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 rounded-full overflow-hidden',
        'bg-gradient-to-br from-accent to-purple-600',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="object-cover w-full h-full"
          unoptimized
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full font-semibold text-white">
          {initials}
        </span>
      )}
    </div>
  )
}
