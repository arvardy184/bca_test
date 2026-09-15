import { describe, expect, it } from 'vitest'
import { isValidNIK } from '@/utils/validation'
import { buildSeedBundle } from './seed'

describe('buildSeedBundle', () => {
  const bundle = buildSeedBundle()

  it('has at least 12 applications and 12 customers', () => {
    expect(bundle.applications.length).toBeGreaterThanOrEqual(12)
    expect(bundle.customers.length).toBeGreaterThanOrEqual(12)
  })

  it('gives every customer a valid 16-digit NIK', () => {
    bundle.customers.forEach((c) => expect(isValidNIK(c.nik)).toBe(true))
  })

  it('references only customer/vehicle/dealer ids that exist', () => {
    const customerIds = new Set(bundle.customers.map((c) => c.id))
    const vehicleIds = new Set(bundle.vehicles.map((v) => v.id))
    const dealerIds = new Set(['dealer-1', 'dealer-2', 'dealer-3'])
    bundle.applications.forEach((app) => {
      expect(customerIds.has(app.customerId)).toBe(true)
      expect(vehicleIds.has(app.vehicleId)).toBe(true)
      expect(dealerIds.has(app.dealerId)).toBe(true)
    })
  })

  it('spreads applications across multiple distinct statuses', () => {
    const statuses = new Set(bundle.applications.map((a) => a.status))
    expect(statuses.size).toBeGreaterThanOrEqual(6)
  })

  it('gives every application exactly 5 document slots', () => {
    bundle.applications.forEach((app) => {
      const docs = bundle.documents.filter((d) => d.applicationId === app.id)
      expect(docs.length).toBe(5)
    })
  })

  it('every document references an application that exists', () => {
    const appIds = new Set(bundle.applications.map((a) => a.id))
    bundle.documents.forEach((d) => expect(appIds.has(d.applicationId)).toBe(true))
  })
})
