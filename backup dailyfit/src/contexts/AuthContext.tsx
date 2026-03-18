'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User { id: number; name: string; email: string }
interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  try {
    const t = localStorage.getItem('df_token')
    const u = localStorage.getItem('df_user')
    console.log('AuthContext init - token:', !!t, 'user:', u)
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
  } catch (e) {
    console.error('AuthContext error:', e)
  } finally {
    setLoading(false)
  }
}, [])

  const login = (t: string, u: User) => {
    localStorage.setItem('df_token', t)
    localStorage.setItem('df_user', JSON.stringify(u))
    setToken(t); setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('df_token')
    localStorage.removeItem('df_user')
    setToken(null); setUser(null)
    fetch('/api/auth?action=logout', { method: 'POST' })
  }

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
