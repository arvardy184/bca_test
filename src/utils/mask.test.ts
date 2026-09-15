import { describe, expect, it } from 'vitest'
import { maskNIK } from './mask'

describe('maskNIK', () => {
  it('keeps first 4 and last 4 digits, masks the middle', () => {
    expect(maskNIK('3573010101900001')).toBe('3573********0001')
  })
  it('returns input unchanged if not 16 digits', () => {
    expect(maskNIK('12345')).toBe('12345')
  })
})
