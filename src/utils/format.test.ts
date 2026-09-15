import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatDateTime } from './format'

describe('formatCurrency', () => {
  it('formats with Rp prefix and dot thousands separator', () => {
    expect(formatCurrency(250000000)).toBe('Rp 250.000.000')
    expect(formatCurrency(0)).toBe('Rp 0')
  })
})

describe('formatDate', () => {
  it('formats as D MMM YYYY', () => {
    expect(formatDate('2026-09-15T09:12:00.000Z')).toMatch(/^\d{2} Sep 2026$/)
  })
})

describe('formatDateTime', () => {
  it('appends HH:mm', () => {
    expect(formatDateTime('2026-09-15T09:12:00.000Z')).toMatch(/^\d{2} Sep 2026 \d{2}:\d{2}$/)
  })
})
