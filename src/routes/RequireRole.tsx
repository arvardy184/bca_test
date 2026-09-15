import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Role } from '@/types'
import { useAuth } from '@/context/AuthContext'

// Demo-only convenience: real access control must be enforced server-side.
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!roles.includes(currentUser.role)) return <Navigate to="/403" replace />
  return <>{children}</>
}
