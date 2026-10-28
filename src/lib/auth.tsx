import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabase'

interface AuthState {
  configured: boolean
  loading: boolean
  roleLoading: boolean
  session: Session | null
  user: User | null
  isClinicAdmin: boolean
}

const AuthContext = createContext<AuthState>({
  configured: false,
  loading: true,
  roleLoading: false,
  session: null,
  user: null,
  isClinicAdmin: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [roleLoading, setRoleLoading] = useState(false)
  const [isClinicAdmin, setIsClinicAdmin] = useState(false)
  const roleUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true
    const sessionTimeout = window.setTimeout(() => {
      if (active) setLoading(false)
    }, 8000)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.clearTimeout(sessionTimeout)
      setSession(nextSession)
      setLoading(false)
      const nextUserId = nextSession?.user.id ?? null
      if (nextUserId !== roleUserId.current) {
        roleUserId.current = nextUserId
        setRoleLoading(Boolean(nextUserId))
      }
      if (!nextSession) {
        setIsClinicAdmin(false)
        setRoleLoading(false)
      }
    })
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) throw error
      setSession(data.session)
      setLoading(false)
    }).catch(() => {
      if (active) setLoading(false)
    }).finally(() => window.clearTimeout(sessionTimeout))
    return () => {
      active = false
      window.clearTimeout(sessionTimeout)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session?.user.id) {
      roleUserId.current = null
      setIsClinicAdmin(false)
      setRoleLoading(false)
      return
    }
    let active = true
    roleUserId.current = session.user.id
    setRoleLoading(true)
    void (async () => {
      try {
        const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).maybeSingle()
        if (active) setIsClinicAdmin(!error && data?.role === 'clinic_admin')
      } catch {
        if (active) setIsClinicAdmin(false)
      } finally {
        if (active) setRoleLoading(false)
      }
    })()
    return () => { active = false }
  }, [session])

  const value = useMemo(() => ({
    configured: supabaseConfigured,
    loading,
    roleLoading,
    session,
    user: session?.user ?? null,
    isClinicAdmin,
  }), [loading, roleLoading, session, isClinicAdmin])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
