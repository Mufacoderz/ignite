'use client'
import { motion } from 'framer-motion'
import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-fire-grad text-white shadow-fire hover:shadow-fire-lg',
    secondary: 'bg-amber-500/10 text-ember-500 border border-amber-500/20 hover:bg-amber-500/20',
    ghost: 'bg-stone-800/60 text-stone-400 border border-stone-700/50 hover:bg-stone-700/60 hover:text-stone-200',
    danger: 'bg-red-950/40 text-red-400 border border-red-900/30 hover:bg-red-900/40',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}
