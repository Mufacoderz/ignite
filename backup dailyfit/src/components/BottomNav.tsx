'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, CalendarCheck, ClipboardList, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { href: '/plans', icon: CalendarCheck, label: 'Plans' },
  { href: '/checklist', icon: ClipboardList, label: 'Checklist' },
  { href: '/stats', icon: BarChart3, label: 'Stats' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center bg-stone-950 rounded-[28px] p-1.5 gap-1 shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-stone-800/60 w-full max-w-sm">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 rounded-[20px] transition-all duration-200',
                  active ? 'bg-fire-grad shadow-fire' : 'hover:bg-stone-800/60'
                )}
              >
                <Icon size={19} className={active ? 'text-white' : 'text-stone-500'} />
                <span className={cn(
                  'text-[9px] font-black tracking-wider uppercase',
                  active ? 'text-white/90' : 'text-stone-500'
                )}>
                  {label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
