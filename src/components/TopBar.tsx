'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/exercises': 'Exercises',
  '/plans': 'Workout Plans',
  '/checklist': 'Daily Checklist',
  '/stats': 'Statistics',
}

export default function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const title = titles[pathname] || 'DailyFit'

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-stone-950/90 backdrop-blur-xl border-b border-stone-800/50 flex items-center justify-between px-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-fire-grad flex items-center justify-center shadow-fire">
          <Zap size={13} className="text-white" />
        </div>
        <div>
          <span className="font-display text-lg tracking-widest bg-fire-grad bg-clip-text text-transparent leading-none">DAILYFIT</span>
          <span className="text-stone-500 mx-2 text-xs">·</span>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-fire-grad flex items-center justify-center text-white font-display text-xs shadow-fire">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { logout(); router.push('/login') }}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-stone-700 text-stone-400 hover:text-red-400 hover:border-red-800 transition-all"
        >
          <LogOut size={13} />
        </motion.button>
      </div>
    </header>
  )
}
