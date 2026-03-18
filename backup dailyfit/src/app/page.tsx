'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import StatCard from '@/components/StatCard'
import { motion } from 'framer-motion'
import { Flame, Dumbbell, Calendar, TrendingUp, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [weekly, setWeekly] = useState<any[]>([])
  const [checklist, setChecklist] = useState<any[]>([])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    console.log('Dashboard - loading:', loading, 'user:', user)
    if (!loading && !user) {
      setTimeout(() => {
        window.location.replace('/login')
      }, 500)
    }
  }, [user, loading])

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get('/api/stats?type=overview'),
      api.get('/api/stats?type=weekly'),
      api.get(`/api/checklist?date=${today}`)
    ]).then(([s, w, c]) => { setStats(s); setWeekly(w); setChecklist(c) })
  }, [user])

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-stone-700 border-t-ember-500 rounded-full animate-spin" />
    </div>
  )
  if (!user) return null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING'
  const done = checklist.filter((i: any) => i.isCompleted).length
  const total = checklist.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex min-h-screen bg-stone-950">
      <Sidebar />
      <div className="flex-1 md:ml-[240px]">
        <TopBar />
        <main className="px-4 md:px-8 pt-20 md:pt-10 pb-28 md:pb-10 max-w-5xl mx-auto">

          {/* Hero greeting */}
          <div className="mb-8">
            <p className="text-stone-500 text-sm font-bold tracking-widest uppercase mb-1">{greeting}</p>
            <h1 className="font-display text-5xl md:text-6xl tracking-wider leading-none">
              <span className="text-fire-grad">{user.name.toUpperCase()}</span>
            </h1>
            <p className="text-stone-400 mt-2 text-sm">Here's your fitness overview for today</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard value={stats?.streak ?? 0} label="Day Streak" icon={<Flame size={36} />} delay={0} />
            <StatCard value={stats?.totalExercises ?? 0} label="Exercises" icon={<Dumbbell size={36} />} delay={0} />
            <StatCard value={stats?.totalWorkoutDays ?? 0} label="Workout Days" icon={<Calendar size={36} />} delay={0} />
            <StatCard value={`${stats?.completionRate ?? 0}%`} label="Completion" icon={<TrendingUp size={36} />} delay={0} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Today checklist */}
            <div className="bg-stone-900 border border-stone-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl tracking-wider text-white">TODAY'S WORKOUT</h2>
                <Link href="/checklist" className="flex items-center gap-1 text-xs font-bold text-ember-500 hover:text-ember-400 transition-colors">
                  View All <ArrowRight size={12} />
                </Link>
              </div>
              {total > 0 ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-stone-500 uppercase tracking-wider">Progress</span>
                      <span className="text-ember-500">{done}/{total}</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-fire-grad rounded-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {checklist.slice(0, 4).map((item: any) => (
                      <div key={item.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        item.isCompleted ? 'bg-emerald-950/30 border-emerald-800/30' : 'bg-stone-800/40 border-stone-700/30'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.isCompleted ? 'bg-emerald-600' : 'border-2 border-stone-600'
                        }`}>
                          {item.isCompleted && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`text-sm font-semibold flex-1 ${item.isCompleted ? 'line-through text-stone-500' : 'text-stone-200'}`}>
                          {item.exercise?.name}
                        </span>
                        <span className="text-xs text-stone-600">{item.exercise?.sets}×{item.exercise?.reps}</span>
                      </div>
                    ))}
                    {total > 4 && <p className="text-center text-xs text-stone-600 pt-1">+{total - 4} more</p>}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="text-4xl mb-3 opacity-40">📋</div>
                  <p className="font-display text-lg tracking-wider text-stone-500 mb-1">NO EXERCISES TODAY</p>
                  <p className="text-xs text-stone-600 mb-4">Add exercises to get started</p>
                  <Link href="/checklist">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="bg-fire-grad text-white text-xs font-bold px-4 py-2 rounded-xl shadow-fire cursor-pointer">
                      Go to Checklist
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>

            {/* Weekly bar chart — animasi height dipertahankan */}
            <div className="bg-stone-900 border border-stone-700/50 rounded-2xl p-5">
              <h2 className="font-display text-xl tracking-wider text-white mb-5">WEEKLY PROGRESS</h2>
              <div className="flex items-end gap-2 h-28">
                {weekly.map((d: any, i: number) => {
                  const pct = d.total > 0 ? d.completed / d.total : 0
                  const isToday = d.date === today
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: d.total > 0 ? `${Math.max(pct * 88, 8)}px` : '4px' }}
                        transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                        className={`w-full rounded-lg ${isToday ? 'bg-fire-grad shadow-fire' : d.total > 0 ? 'bg-ember-700/40' : 'bg-stone-800'}`}
                      />
                      <span className={`text-[10px] font-black tracking-wider uppercase ${isToday ? 'text-ember-500' : 'text-stone-600'}`}>
                        {d.day}
                      </span>
                    </div>
                  )
                })}
              </div>
              <Link href="/stats">
                <motion.div whileHover={{ x: 3 }} className="flex items-center justify-center gap-1 mt-4 text-xs font-bold text-stone-500 hover:text-ember-500 transition-colors cursor-pointer">
                  Full Statistics <ChevronRight size={12} />
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-5">
            <h2 className="font-display text-xl tracking-wider text-stone-400 mb-3">QUICK ACTIONS</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/exercises', label: '+ Exercise' },
                { href: '/plans', label: 'New Plan' },
                { href: '/checklist', label: 'Start Workout' },
                { href: '/stats', label: 'View Stats' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 bg-stone-800/60 border border-stone-700/40 hover:border-ember-700/50 text-stone-300 hover:text-white text-sm font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">
                    {label}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}