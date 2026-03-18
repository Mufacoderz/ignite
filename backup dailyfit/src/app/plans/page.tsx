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
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Dumbbell, PlayCircle, CalendarDays } from 'lucide-react'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function PlanForm({ plan, exercises, onSave, onClose }: any) {
  const [form, setForm] = useState({
    name: plan?.name || '', description: plan?.description || '',
    scheduledDate: plan?.scheduledDate?.split('T')[0] || '',
    dayOfWeek: plan?.dayOfWeek || '',
    exerciseIds: plan?.exercises?.map((e: any) => e.exerciseId) || []
  })
  const [loading, setLoading] = useState(false)

  const toggle = (id: number) => setForm(f => ({
    ...f, exerciseIds: f.exerciseIds.includes(id) ? f.exerciseIds.filter((i: number) => i !== id) : [...f.exerciseIds, id]
  }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    if (plan?.id) await api.put(`/api/plans/${plan.id}`, form)
    else await api.post('/api/plans', form)
    setLoading(false); onSave()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Plan Name *</label>
        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Push Day, Leg Day..."
          className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-600 transition-all" />
      </div>
      <div>
        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Description</label>
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
          className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-600 transition-all resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Scheduled Date</label>
          <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})}
            className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-ember-600 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Day of Week</label>
          <select value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: e.target.value})}
            className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-ember-600 transition-all">
            <option value="">Any day</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">
          Exercises ({form.exerciseIds.length} selected)
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1 border border-stone-700/50 rounded-xl p-2 bg-stone-800/30">
          {exercises.map((ex: any) => (
            <label key={ex.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
              form.exerciseIds.includes(ex.id) ? 'bg-ember-600/15 border border-ember-600/20' : 'hover:bg-stone-700/30'
            }`}>
              <input type="checkbox" checked={form.exerciseIds.includes(ex.id)} onChange={() => toggle(ex.id)}
                className="accent-orange-500 w-4 h-4" />
              <span className="text-sm font-semibold text-white flex-1">{ex.name}</span>
              <span className="text-xs text-stone-500">{ex.category}</span>
            </label>
          ))}
          {exercises.length === 0 && <p className="text-center text-sm text-stone-600 py-3">No exercises yet</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit" disabled={loading}>
          {loading ? 'Saving...' : plan?.id ? 'Save Changes' : 'Create Plan'}
        </Button>
      </div>
    </form>
  )
}

export default function PlansPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading])

  const load = async () => {
    setPageLoading(true)
    const [p, e] = await Promise.all([api.get('/api/plans'), api.get('/api/exercises')])
    setPlans(Array.isArray(p) ? p : [])
    setExercises(Array.isArray(e) ? e : [])
    setPageLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this plan?')) return
    await api.delete(`/api/plans/${id}`); load()
  }

  const startWorkout = async (plan: any) => {
    const today = new Date().toISOString().split('T')[0]
    await api.post('/api/checklist/from-plan', { planId: plan.id, date: today })
    router.push('/checklist')
  }

  if (loading || !user) return null

  return (
    <div className="flex min-h-screen bg-stone-950">
      <Sidebar />
      <div className="flex-1 md:ml-[240px]">
        <TopBar />
        <main className="px-4 md:px-8 pt-20 md:pt-10 pb-28 md:pb-10 max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-display text-5xl tracking-wider text-fire-grad leading-none">WORKOUT PLANS</h1>
              <p className="text-stone-500 text-sm mt-1">{plans.length} custom plans</p>
            </div>
            <Button onClick={() => { setEditing(null); setShowModal(true) }}><Plus size={15} /> New Plan</Button>
          </div>

          {pageLoading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-stone-700 border-t-ember-500 rounded-full animate-spin" /></div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="text-5xl mb-4 opacity-30">📋</div>
              <p className="font-display text-2xl tracking-wider text-stone-500 mb-2">NO PLANS YET</p>
              <p className="text-stone-600 text-sm mb-5">Create your first workout plan</p>
              <Button onClick={() => { setEditing(null); setShowModal(true) }}><Plus size={15} /> Create First Plan</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <motion.div key={plan.id} whileHover={{ y: -3 }}
                  className="bg-stone-900 border border-stone-700/50 rounded-2xl overflow-hidden flex flex-col">
                  <div className="bg-fire-grad p-4">
                    <div className="font-display text-xl tracking-wider text-white">{plan.name}</div>
                    {plan.description && <div className="text-xs text-white/70 mt-1">{plan.description}</div>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {plan.scheduledDate && (
                        <span className="text-[10px] font-bold bg-white/15 text-white/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CalendarDays size={9} />{new Date(plan.scheduledDate).toLocaleDateString()}
                        </span>
                      )}
                      {plan.dayOfWeek && (
                        <span className="text-[10px] font-bold bg-white/15 text-white/80 px-2 py-0.5 rounded-full">{plan.dayOfWeek}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-3">
                      <Dumbbell size={12} />{plan.exercises?.length || 0} exercises
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {plan.exercises?.slice(0,4).map((pe: any) => (
                        <span key={pe.id} className="text-[10px] font-bold bg-stone-800 text-stone-400 border border-stone-700/50 px-2 py-0.5 rounded-full">
                          {pe.exercise?.name}
                        </span>
                      ))}
                      {(plan.exercises?.length || 0) > 4 && (
                        <span className="text-[10px] font-bold text-stone-600 px-1">+{plan.exercises.length - 4}</span>
                      )}
                    </div>
                    <div className="flex gap-2 border-t border-stone-700/40 pt-3 mt-auto">
                      <button onClick={() => startWorkout(plan)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-fire-grad text-white text-xs font-black py-2 rounded-xl shadow-fire hover:shadow-fire-lg transition-all">
                        <PlayCircle size={13} /> Start Today
                      </button>
                      <button onClick={() => { setEditing(plan); setShowModal(true) }}
                        className="w-8 flex items-center justify-center bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(plan.id)}
                        className="w-8 flex items-center justify-center bg-stone-800 text-stone-500 hover:text-red-400 rounded-xl transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomNav />
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing?.id ? 'EDIT PLAN' : 'NEW PLAN'}>
        <PlanForm plan={editing} exercises={exercises} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load() }} />
      </Modal>
    </div>
  )
}