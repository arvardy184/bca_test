import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// Demo-only convenience: real access control must be enforced server-side.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}
