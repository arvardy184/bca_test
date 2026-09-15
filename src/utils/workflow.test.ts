import { describe, expect, it } from 'vitest'
import { canTransition, nextStatusesFor, STATUS_FLOW, STATUS_META } from './workflow'

describe('canTransition', () => {
  it('allows Sales Dealer to submit a Draft', () => {
    expect(canTransition('Draft', 'Submitted', 'sales_dealer')).toBe(true)
  })
  it('does not allow Sales Dealer to approve', () => {
    expect(canTransition('Waiting Approval', 'Approved', 'sales_dealer')).toBe(false)
  })
  it('allows Marketing to move Submitted to Under Review, and Under Review to Waiting Approval or Need Revision', () => {
    expect(canTransition('Submitted', 'Under Review', 'marketing')).toBe(true)
    expect(canTransition('Under Review', 'Waiting Approval', 'marketing')).toBe(true)
    expect(canTransition('Under Review', 'Need Revision', 'marketing')).toBe(true)
  })
  it('allows Marketing Supervisor to approve, reject, or request revision from Waiting Approval', () => {
    expect(canTransition('Waiting Approval', 'Approved', 'marketing_supervisor')).toBe(true)
    expect(canTransition('Waiting Approval', 'Rejected', 'marketing_supervisor')).toBe(true)
    expect(canTransition('Waiting Approval', 'Need Revision', 'marketing_supervisor')).toBe(true)
  })
  it('allows Back Office to progress Approved through Disbursed', () => {
    expect(canTransition('Approved', 'Document Pending', 'back_office')).toBe(true)
    expect(canTransition('Document Pending', 'Signed', 'back_office')).toBe(true)
    expect(canTransition('Signed', 'Ready for Disbursement', 'back_office')).toBe(true)
    expect(canTransition('Ready for Disbursement', 'Disbursed', 'back_office')).toBe(true)
  })
  it('rejects a transition not in the role map', () => {
    expect(canTransition('Draft', 'Disbursed', 'sales_dealer')).toBe(false)
  })
})

describe('nextStatusesFor', () => {
  it('lists the allowed next statuses for a role+status pair', () => {
    expect(nextStatusesFor('Waiting Approval', 'marketing_supervisor').sort()).toEqual(
      ['Approved', 'Need Revision', 'Rejected'].sort(),
    )
  })
  it('returns an empty array when the role has no transitions from that status', () => {
    expect(nextStatusesFor('Disbursed', 'sales_dealer')).toEqual([])
  })
})

describe('STATUS_META', () => {
  it('has an entry for every status referenced by STATUS_FLOW', () => {
    STATUS_FLOW.forEach((status) => expect(STATUS_META[status]).toBeDefined())
  })
})
