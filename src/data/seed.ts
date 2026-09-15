import type { Approval, AuditLog, Customer, DocumentRecord, LoanApplication, Vehicle } from '@/types'
import { SEED_APPLICATIONS, SEED_APPROVALS, SEED_AUDIT_LOGS, SEED_DOCUMENTS, SEED_VEHICLES } from './applications'
import { SEED_CUSTOMERS } from './customers'

export interface SeedBundle {
  customers: Customer[]
  vehicles: Vehicle[]
  applications: LoanApplication[]
  documents: DocumentRecord[]
  approvals: Approval[]
  auditLogs: AuditLog[]
}

export function buildSeedBundle(): SeedBundle {
  return {
    customers: SEED_CUSTOMERS,
    vehicles: SEED_VEHICLES,
    applications: SEED_APPLICATIONS,
    documents: SEED_DOCUMENTS,
    approvals: SEED_APPROVALS,
    auditLogs: SEED_AUDIT_LOGS,
  }
}
