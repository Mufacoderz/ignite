'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StatCardProps {
  value: string | number
  label: string
  icon: ReactNode
  delay?: number
}

export default function StatCard({ value, label, icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative bg-stone-900 border border-stone-700/50 rounded-2xl p-5 overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-fire-grad" />
      <div className="absolute top-4 right-4 text-stone-700 group-hover:text-stone-600 transition-colors">
        {icon}
      </div>
      <div className="font-display text-4xl tracking-wide text-white leading-none mb-1">
        {value}
      </div>
      <div className="text-xs font-bold text-stone-500 tracking-widest uppercase">{label}</div>
    </motion.div>
  )
}
