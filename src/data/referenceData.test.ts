import { describe, expect, it } from 'vitest'
import { DEALERS } from './dealers'
import { VEHICLE_BRANDS, VEHICLE_COLORS, VEHICLE_MODELS } from './vehicleCatalog'
import { DEMO_USERS } from './users'

describe('reference data', () => {
  it('has at least 3 dealers with name and city', () => {
    expect(DEALERS.length).toBeGreaterThanOrEqual(3)
    DEALERS.forEach((d) => {
      expect(d.name).toBeTruthy()
      expect(d.city).toBeTruthy()
    })
  })

  it('has 5 vehicle brands each with at least one model and a base price', () => {
    expect(VEHICLE_BRANDS.length).toBe(5)
    VEHICLE_BRANDS.forEach((brand) => {
      const entry = VEHICLE_MODELS[brand]
      expect(entry.models.length).toBeGreaterThan(0)
      entry.models.forEach((model) => {
        expect(entry.basePrice[model]).toBeGreaterThan(0)
        expect(entry.typesByModel[model].length).toBeGreaterThan(0)
      })
    })
  })

  it('has at least 4 vehicle colors', () => {
    expect(VEHICLE_COLORS.length).toBeGreaterThanOrEqual(4)
  })

  it('has exactly one demo user per role', () => {
    expect(Object.keys(DEMO_USERS).sort()).toEqual(
      ['back_office', 'marketing', 'marketing_supervisor', 'sales_dealer'].sort(),
    )
  })
})
