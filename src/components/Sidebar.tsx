'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, Dumbbell, CalendarCheck, ClipboardList, BarChart3, LogOut, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { href: '/plans', icon: CalendarCheck, label: 'Workout Plans' },
  { href: '/checklist', icon: ClipboardList, label: 'Daily Checklist' },
  { href: '/stats', icon: BarChart3, label: 'Statistics' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => { logout(); router.push('/login') }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] bg-stone-950 flex-col z-40 border-r border-stone-800/50">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-stone-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-fire-grad flex items-center justify-center shadow-fire">
            <Zap size={16} className="text-white" />
          </div>
            <div className="font-display text-2xl tracking-widest leading-none" style={{background: 'linear-gradient(135deg, #DC2626, #EA580C, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>DAILYFIT</div>
          </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer',
                  active
                    ? 'bg-gradient-to-r from-fire-600/25 to-ember-600/15 text-white border border-fire-600/25'
                    : 'text-stone-500 hover:text-stone-200 hover:bg-stone-800/50'
                )}
              >
                <Icon size={17} className={active ? 'text-ember-500' : ''} />
                {label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-ember-500"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-stone-800/50 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-stone-900/60 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-fire-grad flex items-center justify-center text-white font-display text-sm flex-shrink-0 shadow-fire">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-stone-500 truncate">{user?.email}</div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 border border-red-900/30 bg-red-950/20 hover:bg-red-900/30 hover:text-red-300 transition-all"
        >
          <LogOut size={13} /> SIGN OUT
        </motion.button>
      </div>
    </aside>
  )
}
