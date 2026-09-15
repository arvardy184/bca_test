import { describe, expect, it } from 'vitest'
import { generateApplicationCode, generateId } from './id'

describe('generateId', () => {
  it('produces unique prefixed ids', () => {
    const a = generateId('doc')
    const b = generateId('doc')
    expect(a).not.toBe(b)
    expect(a.startsWith('doc-')).toBe(true)
  })
})

describe('generateApplicationCode', () => {
  it('formats as APP-YYYY-##### with 5-digit zero-padded sequence', () => {
    expect(generateApplicationCode(2026, 128)).toBe('APP-2026-00128')
  })
})
