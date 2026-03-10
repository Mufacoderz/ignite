'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth?action=register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message); return }
      login(data.token, data.user)
      router.push('/')
    } catch { setError('Network error.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-stone-950 to-orange-950/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/8 rounded-full blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-fire-grad flex items-center justify-center shadow-fire">
            <Zap size={16} className="text-white" />
          </div>
          <div className="font-display text-3xl tracking-widest text-fire-grad">DAILYFIT</div>
        </div>
        <h1 className="font-display text-4xl tracking-wider text-white mb-1">CREATE ACCOUNT</h1>
        <p className="text-stone-500 text-sm mb-8">Start your fitness journey today 🔥</p>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-950/50 border border-red-800/50 text-red-400 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
            ⚠️ {error}
          </motion.div>
        )}
        <form onSubmit={submit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">{label}</label>
              <input type={type} required placeholder={placeholder}
                value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-600 focus:ring-1 focus:ring-ember-600/30 transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="w-full bg-stone-800/60 border border-stone-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-ember-600 focus:ring-1 focus:ring-ember-600/30 transition-all pr-11" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full bg-fire-grad text-white font-black text-sm py-3.5 rounded-xl shadow-fire hover:shadow-fire-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
            <Zap size={16} /> {loading ? 'CREATING...' : 'GET STARTED'}
          </motion.button>
        </form>
        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account? <Link href="/login" className="text-ember-500 font-bold hover:text-ember-400 transition-colors">Log in</Link>
        </p>
      </motion.div>
    </div>
  )
}
