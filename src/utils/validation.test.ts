import { describe, expect, it } from 'vitest'
import { isValidEmail, isValidIncome, isValidNIK, isValidPhone } from './validation'

describe('isValidNIK', () => {
  it('requires exactly 16 digits', () => {
    expect(isValidNIK('3573010101900001')).toBe(true)
    expect(isValidNIK('123')).toBe(false)
    expect(isValidNIK('357301010190000a')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('accepts Indonesian mobile formats', () => {
    expect(isValidPhone('081234567890')).toBe(true)
    expect(isValidPhone('+6281234567890')).toBe(true)
    expect(isValidPhone('123')).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('requires an @ and a domain', () => {
    expect(isValidEmail('budi@example.com')).toBe(true)
    expect(isValidEmail('not-an-email')).toBe(false)
  })
})

describe('isValidIncome', () => {
  it('requires a positive numeric string', () => {
    expect(isValidIncome('8000000')).toBe(true)
    expect(isValidIncome('0')).toBe(false)
    expect(isValidIncome('8jt')).toBe(false)
  })
})
