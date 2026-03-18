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
import { Flame, Dumbbell, Calendar, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'

const PIE_COLORS = ['#DC2626','#EA580C','#10B981','#3B82F6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-stone-900 border border-stone-700/60 rounded-xl px-3 py-2 text-xs">
      <p className="font-bold text-stone-300 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function StatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [overview, setOverview] = useState<any>(null)
  const [weekly, setWeekly] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading])

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get('/api/stats?type=overview'),
      api.get('/api/stats?type=weekly'),
      api.get('/api/stats?type=categories')
    ]).then(([o, w, c]) => {
      setOverview(o); setWeekly(w); setCategories(c)
      setPageLoading(false)
    })
  }, [user])

  if (loading || !user) return null

  return (
    <div className="flex min-h-screen bg-stone-950">
      <Sidebar />
      <div className="flex-1 md:ml-[240px]">
        <TopBar />
        <main className="px-4 md:px-8 pt-20 md:pt-10 pb-28 md:pb-10 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="font-display text-5xl tracking-wider text-fire-grad leading-none">STATISTICS</h1>
            <p className="text-stone-500 text-sm mt-1">Your progress at a glance</p>
          </motion.div>

          {pageLoading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-stone-700 border-t-ember-500 rounded-full animate-spin" /></div>
          ) : (
            <>
              {/* Overview cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard value={overview?.streak ?? 0} label="Day Streak 🔥" icon={<Flame size={36} />} delay={0.05} />
                <StatCard value={overview?.totalExercises ?? 0} label="Total Exercises" icon={<Dumbbell size={36} />} delay={0.1} />
                <StatCard value={overview?.totalWorkoutDays ?? 0} label="Workout Days" icon={<Calendar size={36} />} delay={0.15} />
                <StatCard value={`${overview?.completionRate ?? 0}%`} label="Completion Rate" icon={<TrendingUp size={36} />} delay={0.2} />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Weekly bar chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="bg-stone-900 border border-stone-700/50 rounded-2xl p-5">
                  <h2 className="font-display text-xl tracking-wider text-white mb-5">WEEKLY ACTIVITY</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weekly} barGap={4}>
                      <XAxis dataKey="day" tick={{ fill: '#78716C', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="total" name="Total" fill="#292524" radius={[4,4,0,0]} />
                      <Bar dataKey="completed" name="Done" fill="url(#fireGrad)" radius={[4,4,0,0]} />
                      <defs>
                        <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#DC2626" />
                          <stop offset="100%" stopColor="#EA580C" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Category pie */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-stone-900 border border-stone-700/50 rounded-2xl p-5">
                  <h2 className="font-display text-xl tracking-wider text-white mb-5">BY CATEGORY</h2>
                  {categories.length === 0 ? (
                    <div className="flex items-center justify-center h-[180px] text-stone-600 text-sm">No data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                          {categories.map((_: any, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend formatter={(v) => <span className="text-xs font-bold text-stone-400 capitalize">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              </div>

              {/* Completion line chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="bg-stone-900 border border-stone-700/50 rounded-2xl p-5">
                <h2 className="font-display text-xl tracking-wider text-white mb-5">COMPLETION TREND (7 DAYS)</h2>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="day" tick={{ fill: '#78716C', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="completed" name="Completed" stroke="#EA580C" strokeWidth={2.5}
                      dot={{ fill: '#EA580C', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#DC2626' }} />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#44403C" strokeWidth={2}
                      dot={{ fill: '#44403C', strokeWidth: 0, r: 3 }} strokeDasharray="5 4" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
