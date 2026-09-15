import type { ApplicationStatus, Role } from '@/types'

export const STATUS_FLOW: ApplicationStatus[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'Waiting Approval',
  'Approved',
  'Document Pending',
  'Signed',
  'Ready for Disbursement',
  'Disbursed',
]

export const STATUS_META: Record<ApplicationStatus, { label: string; color: 'blue' | 'green' | 'amber' | 'red' | 'gray' }> = {
  Draft: { label: 'Draft', color: 'gray' },
  Submitted: { label: 'Submitted', color: 'blue' },
  'Under Review': { label: 'Under Review', color: 'blue' },
  'Need Revision': { label: 'Need Revision', color: 'amber' },
  'Waiting Approval': { label: 'Waiting Approval', color: 'amber' },
  Approved: { label: 'Approved', color: 'green' },
  Rejected: { label: 'Rejected', color: 'red' },
  'Document Pending': { label: 'Document Pending', color: 'amber' },
  Signed: { label: 'Signed', color: 'blue' },
  'Ready for Disbursement': { label: 'Ready for Disbursement', color: 'blue' },
  Disbursed: { label: 'Disbursed', color: 'green' },
}

const ROLE_TRANSITIONS: Record<Role, Partial<Record<ApplicationStatus, ApplicationStatus[]>>> = {
  sales_dealer: {
    Draft: ['Submitted'],
  },
  marketing: {
    Submitted: ['Under Review'],
    'Under Review': ['Need Revision', 'Waiting Approval'],
  },
  marketing_supervisor: {
    'Waiting Approval': ['Approved', 'Rejected', 'Need Revision'],
  },
  back_office: {
    Approved: ['Document Pending'],
    'Document Pending': ['Signed'],
    Signed: ['Ready for Disbursement'],
    'Ready for Disbursement': ['Disbursed'],
  },
}

export function nextStatusesFor(current: ApplicationStatus, role: Role): ApplicationStatus[] {
  return ROLE_TRANSITIONS[role]?.[current] ?? []
}

export function canTransition(current: ApplicationStatus, next: ApplicationStatus, role: Role): boolean {
  return nextStatusesFor(current, role).includes(next)
}
