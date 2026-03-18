'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Circle, Flame, PlayCircle } from 'lucide-react'

const TAG_COLORS: Record<string, string> = {
  strength: 'bg-red-950/60 text-red-400 border-red-900/40',
  cardio: 'bg-orange-950/60 text-orange-400 border-orange-900/40',
  flexibility: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40',
  balance: 'bg-blue-950/60 text-blue-400 border-blue-900/40',
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toISOString().split('T')[0],
      label: i === 6 ? 'Today' : d.toLocaleDateString('en',{weekday:'short'}),
      day: d.getDate()
    }
  })
}

export default function ChecklistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const days = getLast7Days()
  const [selectedDate, setSelectedDate] = useState(days[6].date)
  const [checklist, setChecklist] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedEx, setSelectedEx] = useState<number[]>([])

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading])

  const loadChecklist = async () => {
    setPageLoading(true)
    const data = await api.get(`/api/checklist?date=${selectedDate}`)
    setChecklist(Array.isArray(data) ? data : [])
    setPageLoading(false)
  }

  useEffect(() => {
    if (!user) return
    Promise.all([api.get('/api/exercises'), api.get('/api/plans')]).then(([e, p]) => {
      setExercises(Array.isArray(e) ? e : [])
      setPlans(Array.isArray(p) ? p : [])
    })
  }, [user])

  useEffect(() => { if (user) loadChecklist() }, [user, selectedDate])

  const toggle = async (id: number) => {
    await api.patch(`/api/checklist/${id}`)
    loadChecklist()
  }

  const remove = async (id: number) => {
    await api.delete(`/api/checklist/${id}`)
    loadChecklist()
  }

  const addExercises = async () => {
    for (const exId of selectedEx) {
      await api.post('/api/checklist', { exerciseId: exId, date: selectedDate })
    }
    setSelectedEx([]); setShowAddModal(false); loadChecklist()
  }

  const loadFromPlan = async (planId: number) => {
    await api.post('/api/checklist/from-plan', { planId, date: selectedDate })
    setShowPlanModal(false); loadChecklist()
  }

  const done = checklist.filter(i => i.isCompleted).length
  const total = checklist.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  if (loading || !user) return null

  return (
    <div className="flex min-h-screen bg-stone-950">
      <Sidebar />
      <div className="flex-1 md:ml-[240px]">
        <TopBar />
        <main className="px-4 md:px-8 pt-20 md:pt-10 pb-28 md:pb-10 max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="font-display text-5xl tracking-wider text-fire-grad leading-none">DAILY CHECKLIST</h1>
            <p className="text-stone-500 text-sm mt-1">Track your exercises day by day</p>
          </div>

          {/* Date strip */}
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
            {days.map((d) => {
              const active = d.date === selectedDate
              return (
                <motion.button key={d.date} whileTap={{ scale: 0.93 }} onClick={() => setSelectedDate(d.date)}
                  className={`flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all ${
                    active ? 'bg-fire-grad border-transparent shadow-fire text-white' : 'bg-stone-900 border-stone-700/50 text-stone-500 hover:border-stone-600'
                  }`}>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${active ? 'text-white/70' : 'text-stone-600'}`}>{d.label}</span>
                  <span className={`font-display text-xl ${active ? 'text-white' : 'text-stone-400'}`}>{d.day}</span>
                </motion.button>
              )
            })}
          </div>

          {/* Progress */}
          {total > 0 && (
            <div className="bg-stone-900 border border-stone-700/50 rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {pct === 100 ? <Flame size={18} className="text-amber-500 animate-pulse" /> : null}
                  <span className="font-display text-xl tracking-wider text-white">{done}/{total} DONE</span>
                </div>
                <span className={`font-display text-2xl ${pct === 100 ? 'text-fire-grad' : 'text-ember-500'}`}>{pct}%</span>
              </div>
              <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                  className="h-full bg-fire-grad rounded-full" />
              </div>
              {pct === 100 && (
                <p className="text-center text-xs font-bold text-amber-500 mt-2">WORKOUT COMPLETE! CRUSHING IT!</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mb-5">
            <Button onClick={() => setShowAddModal(true)} size="sm"><Plus size={14} /> Add Exercise</Button>
            <Button onClick={() => setShowPlanModal(true)} size="sm" variant="secondary"><PlayCircle size={14} /> Load Plan</Button>
          </div>

          {/* Checklist */}
          {pageLoading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-stone-700 border-t-ember-500 rounded-full animate-spin" /></div>
          ) : checklist.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="text-5xl mb-4 opacity-30">✅</div>
              <p className="font-display text-2xl tracking-wider text-stone-500 mb-2">EMPTY FOR THIS DAY</p>
              <p className="text-stone-600 text-sm">Add exercises or load a workout plan</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {checklist.map((item) => (
                  <motion.div key={item.id} exit={{ opacity: 0, x: 16 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all group ${
                      item.isCompleted ? 'bg-emerald-950/20 border-emerald-800/25' : 'bg-stone-900 border-stone-700/50 hover:border-stone-600/70'
                    }`}>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggle(item.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        item.isCompleted ? 'bg-emerald-600 shadow-[0_0_12px_rgba(5,150,105,0.4)]' : 'border-2 border-stone-600 hover:border-ember-500'
                      }`}>
                      {item.isCompleted ? <CheckCircle2 size={15} className="text-white" /> : <Circle size={15} className="text-transparent" />}
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${item.isCompleted ? 'line-through text-stone-500' : 'text-white'}`}>
                        {item.exercise?.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_COLORS[item.exercise?.category]}`}>
                          {item.exercise?.category}
                        </span>
                        <span className="text-xs text-stone-500">{item.exercise?.sets} × {item.exercise?.reps}</span>
                        {item.exercise?.muscleGroup && <span className="text-xs text-stone-600">{item.exercise.muscleGroup}</span>}
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => remove(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-600 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-950/30">
                      <Trash2 size={14} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
      <BottomNav />

      {/* Add Exercise Modal */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setSelectedEx([]) }} title="ADD EXERCISES">
        <div className="max-h-72 overflow-y-auto space-y-1 mb-4">
          {exercises.filter(ex => !checklist.find(c => c.exerciseId === ex.id)).map(ex => (
            <label key={ex.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
              selectedEx.includes(ex.id) ? 'bg-ember-600/15 border border-ember-600/25' : 'hover:bg-stone-800/60 border border-transparent'
            }`}>
              <input type="checkbox" checked={selectedEx.includes(ex.id)}
                onChange={() => setSelectedEx(s => s.includes(ex.id) ? s.filter(i => i !== ex.id) : [...s, ex.id])}
                className="accent-orange-500 w-4 h-4" />
              <span className="text-sm font-semibold text-white flex-1">{ex.name}</span>
              <span className="text-xs text-stone-500">{ex.sets}×{ex.reps}</span>
            </label>
          ))}
          {exercises.length === 0 && <p className="text-center text-stone-500 py-4 text-sm">No exercises. Add some first!</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setShowAddModal(false); setSelectedEx([]) }}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={addExercises} disabled={selectedEx.length === 0}>
            Add {selectedEx.length > 0 ? `(${selectedEx.length})` : ''}
          </Button>
        </div>
      </Modal>

      {/* Load Plan Modal */}
      <Modal open={showPlanModal} onClose={() => setShowPlanModal(false)} title="LOAD WORKOUT PLAN">
        <div className="space-y-2">
          {plans.map(p => (
            <motion.button key={p.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }} onClick={() => loadFromPlan(p.id)}
              className="w-full flex items-center justify-between bg-stone-800/60 border border-stone-700/50 hover:border-ember-600/40 px-4 py-3 rounded-xl transition-all text-left">
              <div>
                <div className="font-bold text-white text-sm">{p.name}</div>
                <div className="text-xs text-stone-500">{p.exercises?.length || 0} exercises</div>
              </div>
              <PlayCircle size={18} className="text-ember-500" />
            </motion.button>
          ))}
          {plans.length === 0 && <p className="text-center text-stone-500 py-4 text-sm">No plans yet. Create a plan first!</p>}
        </div>
      </Modal>
    </div>
  )
}