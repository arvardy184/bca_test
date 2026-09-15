import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { DataProvider, useData } from './DataContext'

function wrapper({ children }: { children: ReactNode }) {
  return <DataProvider>{children}</DataProvider>
}

describe('DataContext', () => {
  beforeEach(() => localStorage.clear())

  it('seeds localStorage with at least 12 applications on first load', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    expect(result.current.applications.length).toBeGreaterThanOrEqual(12)
    expect(JSON.parse(localStorage.getItem('jkl.applications')!).length).toBe(result.current.applications.length)
  })

  it('does not re-seed on a second mount (persists new applications across reloads)', () => {
    const { result, unmount } = renderHook(() => useData(), { wrapper })
    const countBefore = result.current.applications.length
    act(() => {
      result.current.createApplication({
        customer: {
          name: 'Test Customer', nik: '1234567890123456', dob: '1990-01-01',
          maritalStatus: 'Single', phone: '081234567890', email: 't@example.com',
          address: 'Jl. Test', occupation: 'Engineer', monthlyIncome: 10_000_000,
        },
        vehicle: { brand: 'Toyota', model: 'Avanza', type: '1.3 G MT', color: 'White', price: 235_000_000 },
        dealerId: 'dealer-1',
        financing: {
          vehiclePrice: 235_000_000, downPayment: 40_000_000, financedAmount: 195_000_000,
          tenor: 36, interestRate: 6, insurance: 3_000_000, estimatedInstallment: 6_000_000,
        },
        documents: [
          { type: 'KTP', fileName: 'ktp.pdf', status: 'Uploaded' },
          { type: 'Kartu Keluarga', fileName: null, status: 'Missing' },
          { type: 'SPK', fileName: null, status: 'Missing' },
          { type: 'Bukti Bayar Tanda Jadi', fileName: null, status: 'Missing' },
          { type: 'Form Aplikasi', fileName: 'form.pdf', status: 'Uploaded' },
        ],
        createdBy: 'Andi Wirawan',
      })
    })
    unmount()
    const { result: second } = renderHook(() => useData(), { wrapper })
    expect(second.current.applications.length).toBe(countBefore + 1)
  })

  it('createApplication sets status Draft and writes 5 documents', () => {
    localStorage.clear()
    const { result } = renderHook(() => useData(), { wrapper })
    let created: ReturnType<typeof result.current.createApplication>
    act(() => {
      created = result.current.createApplication({
        customer: {
          name: 'Test Customer 2', nik: '1234567890123457', dob: '1990-01-01',
          maritalStatus: 'Single', phone: '081234567890', email: 't2@example.com',
          address: 'Jl. Test', occupation: 'Engineer', monthlyIncome: 10_000_000,
        },
        vehicle: { brand: 'Honda', model: 'Brio', type: 'Satya E MT', color: 'Black', price: 175_000_000 },
        dealerId: 'dealer-2',
        financing: {
          vehiclePrice: 175_000_000, downPayment: 30_000_000, financedAmount: 145_000_000,
          tenor: 24, interestRate: 6, insurance: 2_000_000, estimatedInstallment: 6_500_000,
        },
        documents: [
          { type: 'KTP', fileName: null, status: 'Missing' },
          { type: 'Kartu Keluarga', fileName: null, status: 'Missing' },
          { type: 'SPK', fileName: null, status: 'Missing' },
          { type: 'Bukti Bayar Tanda Jadi', fileName: null, status: 'Missing' },
          { type: 'Form Aplikasi', fileName: null, status: 'Missing' },
        ],
        createdBy: 'Andi Wirawan',
      })
    })
    expect(created!.status).toBe('Draft')
    expect(result.current.getDocumentsForApplication(created!.id).length).toBe(5)
  })

  it('transitionApplication updates status and appends an audit log when allowed by canTransition', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    const draftApp = result.current.applications.find((a) => a.status === 'Draft')!
    let ok = false
    act(() => {
      ok = result.current.transitionApplication(draftApp.id, 'Submitted', { name: 'Andi Wirawan', role: 'sales_dealer' })
    })
    expect(ok).toBe(true)
    const updated = result.current.getApplicationById(draftApp.id)!
    expect(updated.status).toBe('Submitted')
    const logs = result.current.getAuditLogsForApplication(draftApp.id)
    expect(logs.some((l) => l.action.toLowerCase().includes('submit'))).toBe(true)
  })

  it('transitionApplication refuses a transition canTransition disallows and logs nothing new', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    const draftApp = result.current.applications.find((a) => a.status === 'Draft')!
    const logsBefore = result.current.getAuditLogsForApplication(draftApp.id).length
    let ok = true
    act(() => {
      ok = result.current.transitionApplication(draftApp.id, 'Disbursed', { name: 'Andi Wirawan', role: 'sales_dealer' })
    })
    expect(ok).toBe(false)
    expect(result.current.getApplicationById(draftApp.id)!.status).toBe('Draft')
    expect(result.current.getAuditLogsForApplication(draftApp.id).length).toBe(logsBefore)
  })

  it('verifyDocument marks a document Verified and appends an audit log', () => {
    const { result } = renderHook(() => useData(), { wrapper })
    const anyApp = result.current.applications[0]
    const doc = result.current.getDocumentsForApplication(anyApp.id)[0]
    act(() => {
      result.current.verifyDocument(doc.id, 'Budi Hartono')
    })
    const updatedDoc = result.current.getDocumentsForApplication(anyApp.id).find((d) => d.id === doc.id)!
    expect(updatedDoc.status).toBe('Verified')
    expect(result.current.getAuditLogsForApplication(anyApp.id).some((l) => l.action.includes('verified'))).toBe(true)
  })
})
