import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { Role, User } from '@/types'
import { DEMO_USERS } from '@/data/users'

const STORAGE_KEY = 'jkl.currentUserRole'

export interface AuthContextValue {
  currentUser: User | null
  loginAsRole(role: Role): void
  logout(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadInitialUser(): User | null {
  const role = localStorage.getItem(STORAGE_KEY) as Role | null
  return role ? DEMO_USERS[role] : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(loadInitialUser)

  const loginAsRole = useCallback((role: Role) => {
    localStorage.setItem(STORAGE_KEY, role)
    setCurrentUser(DEMO_USERS[role])
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUser(null)
  }, [])

  return <AuthContext.Provider value={{ currentUser, loginAsRole, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
