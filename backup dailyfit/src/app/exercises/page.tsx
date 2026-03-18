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
import { Plus, Pencil, Trash2, Layers, Search } from 'lucide-react'

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance']
const MUSCLES = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Legs', 'Glutes', 'Full Body']
const TAG_COLORS: Record<string, string> = {
  strength: 'bg-red-950/60 text-red-400 border-red-900/40',
  cardio: 'bg-orange-950/60 text-orange-400 border-orange-900/40',
  flexibility: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40',
  balance: 'bg-blue-950/60 text-blue-400 border-blue-900/40',
}

function ExerciseForm({ exercise, onSave, onClose }: any) {
  const [form, setForm] = useState(exercise || { name: '', muscleGroup: '', category: 'strength', sets: 3, reps: 10, notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (exercise?.id) await api.put(`/api/exercises/${exercise.id}`, form)
      else await api.post('/api/exercises', form)
      onSave()
    } catch { setError('Error saving.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="bg-red-950/50 border border-red-800/40 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}
      <div>
        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Exercise Name *</label>
        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bench Press"
          className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-600 transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-ember-600 transition-all">
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Muscle Group</label>
          <select value={form.muscleGroup} onChange={e => setForm({ ...form, muscleGroup: e.target.value })}
            className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-ember-600 transition-all">
            <option value="">Select...</option>
            {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Sets</label>
          <input type="number" min="1" value={form.sets || ''} onChange={e => setForm({ ...form, sets: e.target.value === '' ? 0 : +e.target.value })}
            className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ember-600 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Reps</label>
          <input type="number" min="1" value={form.reps || ''} onChange={e => setForm({ ...form, reps: e.target.value === '' ? 0 : +e.target.value })}
            className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ember-600 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Notes</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
          placeholder="Tips, variations..." className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-600 transition-all resize-none" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit" disabled={loading}>
          {loading ? 'Saving...' : exercise?.id ? 'Save Changes' : 'Add Exercise'}
        </Button>
      </div>
    </form>
  )
}

export default function ExercisesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [exercises, setExercises] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading])

  const load = async () => {
    setPageLoading(true)
    const data = await api.get('/api/exercises')
    setExercises(Array.isArray(data) ? data : [])
    setPageLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this exercise?')) return
    await api.delete(`/api/exercises/${id}`)
    load()
  }

  const filtered = exercises.filter(ex => {
    const s = search.toLowerCase()
    return (ex.name.toLowerCase().includes(s) || (ex.muscleGroup || '').toLowerCase().includes(s)) &&
      (filterCat === 'all' || ex.category === filterCat)
  })

  if (loading || !user) return null

  return (
    <div className="flex min-h-screen bg-stone-950">
      <Sidebar />
      <div className="flex-1 md:ml-[240px]">
        <TopBar />
        <main className="px-4 md:px-8 pt-20 md:pt-10 pb-28 md:pb-10 max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-display text-5xl tracking-wider text-fire-grad leading-none">EXERCISES</h1>
              <p className="text-stone-500 text-sm mt-1">{exercises.length} exercises in your library</p>
            </div>
            <Button onClick={() => { setEditing(null); setShowModal(true) }}><Plus size={15} /> Add Exercise</Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..."
                className="bg-stone-800/60 border border-stone-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-600 transition-all w-52" />
            </div>
            <div className="flex gap-1.5 bg-stone-900 border border-stone-700/50 rounded-xl p-1 relative">
              {['all', ...CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className="relative px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors z-10"
                  style={{ color: filterCat === cat ? 'white' : '' }}>
                  {filterCat === cat && (
                    <motion.div
                      layoutId="cat-pill"
                      className="absolute inset-0 rounded-lg bg-fire-grad shadow-fire"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span className={filterCat === cat ? 'text-white' : 'text-stone-500 hover:text-stone-300'}>
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {pageLoading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-stone-700 border-t-ember-500 rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="text-5xl mb-4 opacity-30">💪</div>
              <p className="font-display text-2xl tracking-wider text-stone-500 mb-2">NO EXERCISES YET</p>
              <p className="text-stone-600 text-sm mb-5">Start by adding your first exercise</p>
              <Button onClick={() => { setEditing(null); setShowModal(true) }}><Plus size={15} /> Add First Exercise</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {filtered.map((ex) => (
                  <motion.div key={ex.id} whileHover={{ y: -3 }}
                    className="bg-stone-900 border border-stone-700/50 rounded-2xl p-4 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-fire-grad" />
                    <div className="pl-2">
                      <div className="font-bold text-white text-sm mb-2">{ex.name}</div>
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_COLORS[ex.category]}`}>
                          {ex.category}
                        </span>
                        {ex.muscleGroup && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700/50">
                            {ex.muscleGroup}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1"><Layers size={11} />{ex.sets} sets</span>
                        <span>× {ex.reps} reps</span>
                      </div>
                      {ex.notes && <p className="text-xs text-stone-600 mt-2 line-clamp-2">{ex.notes}</p>}
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditing(ex); setShowModal(true) }}
                          className="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-ember-400 transition-colors">
                          <Pencil size={11} /> Edit
                        </button>
                        <button onClick={() => handleDelete(ex.id)}
                          className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-red-400 transition-colors">
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing?.id ? 'EDIT EXERCISE' : 'NEW EXERCISE'}>
        <ExerciseForm exercise={editing} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load() }} />
      </Modal>
    </div>
  )
}