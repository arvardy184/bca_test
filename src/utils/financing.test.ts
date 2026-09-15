import { describe, expect, it } from 'vitest'
import { calculateFinancing } from './financing'

describe('calculateFinancing', () => {
  it('computes financed amount as price minus down payment', () => {
    const result = calculateFinancing({
      vehiclePrice: 250_000_000,
      downPayment: 50_000_000,
      tenor: 60,
      interestRate: 6.5,
      insurance: 5_000_000,
    })
    expect(result.financedAmount).toBe(200_000_000)
  })

  it('spreads financed amount + flat interest + insurance evenly over the tenor', () => {
    const result = calculateFinancing({
      vehiclePrice: 200_000_000,
      downPayment: 40_000_000,
      tenor: 60,
      interestRate: 6,
      insurance: 0,
    })
    expect(result.estimatedInstallment).toBe(3_466_667)
  })

  it('returns whole-rupiah integers (no fractional rupiah)', () => {
    const result = calculateFinancing({
      vehiclePrice: 199_999_999,
      downPayment: 33_333_333,
      tenor: 36,
      interestRate: 5.5,
      insurance: 1_000_000,
    })
    expect(Number.isInteger(result.estimatedInstallment)).toBe(true)
  })
})
