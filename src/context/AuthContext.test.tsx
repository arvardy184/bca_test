import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear())

  it('starts with no current user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.currentUser).toBeNull()
  })

  it("loginAsRole sets the current user to that role's demo user and persists it", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.loginAsRole('marketing_supervisor'))
    expect(result.current.currentUser?.role).toBe('marketing_supervisor')
    expect(localStorage.getItem('jkl.currentUserRole')).toBe('marketing_supervisor')
  })

  it('restores the logged-in user from localStorage on mount', () => {
    localStorage.setItem('jkl.currentUserRole', 'back_office')
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.currentUser?.role).toBe('back_office')
  })

  it('logout clears the current user and localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => result.current.loginAsRole('sales_dealer'))
    act(() => result.current.logout())
    expect(result.current.currentUser).toBeNull()
    expect(localStorage.getItem('jkl.currentUserRole')).toBeNull()
  })
})
