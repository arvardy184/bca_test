import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type {
  Approval,
  ApplicationStatus,
  AuditLog,
  Customer,
  Dealer,
  DocumentRecord,
  DocumentStatus,
  DocumentType,
  Financing,
  LoanApplication,
  Role,
  Vehicle,
} from '@/types'
import { DEALERS } from '@/data/dealers'
import { buildSeedBundle } from '@/data/seed'
import { generateApplicationCode, generateId } from '@/utils/id'
import { canTransition } from '@/utils/workflow'

const STORAGE_KEYS = {
  customers: 'jkl.customers',
  vehicles: 'jkl.vehicles',
  applications: 'jkl.applications',
  documents: 'jkl.documents',
  approvals: 'jkl.approvals',
  auditLogs: 'jkl.auditLogs',
} as const

function readStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function loadInitialState() {
  const existingApplications = readStorage<LoanApplication[]>(STORAGE_KEYS.applications)
  if (existingApplications) {
    return {
      customers: readStorage<Customer[]>(STORAGE_KEYS.customers) ?? [],
      vehicles: readStorage<Vehicle[]>(STORAGE_KEYS.vehicles) ?? [],
      applications: existingApplications,
      documents: readStorage<DocumentRecord[]>(STORAGE_KEYS.documents) ?? [],
      approvals: readStorage<Approval[]>(STORAGE_KEYS.approvals) ?? [],
      auditLogs: readStorage<AuditLog[]>(STORAGE_KEYS.auditLogs) ?? [],
    }
  }
  const seed = buildSeedBundle()
  writeStorage(STORAGE_KEYS.customers, seed.customers)
  writeStorage(STORAGE_KEYS.vehicles, seed.vehicles)
  writeStorage(STORAGE_KEYS.applications, seed.applications)
  writeStorage(STORAGE_KEYS.documents, seed.documents)
  writeStorage(STORAGE_KEYS.approvals, seed.approvals)
  writeStorage(STORAGE_KEYS.auditLogs, seed.auditLogs)
  return seed
}

export interface CreateApplicationInput {
  customer: Omit<Customer, 'id' | 'createdAt'>
  vehicle: Omit<Vehicle, 'id'>
  dealerId: string
  financing: Financing
  documents: { type: DocumentType; fileName: string | null; status: DocumentStatus }[]
  createdBy: string
}

export interface DataContextValue {
  customers: Customer[]
  dealers: Dealer[]
  vehicles: Vehicle[]
  applications: LoanApplication[]
  documents: DocumentRecord[]
  approvals: Approval[]
  auditLogs: AuditLog[]
  getApplicationById(id: string): LoanApplication | undefined
  getCustomerById(id: string): Customer | undefined
  getVehicleById(id: string): Vehicle | undefined
  getDealerById(id: string): Dealer | undefined
  getDocumentsForApplication(applicationId: string): DocumentRecord[]
  getApprovalsForApplication(applicationId: string): Approval[]
  getAuditLogsForApplication(applicationId: string): AuditLog[]
  createApplication(input: CreateApplicationInput): LoanApplication
  transitionApplication(
    applicationId: string,
    nextStatus: ApplicationStatus,
    actor: { name: string; role: Role },
    notes?: string,
  ): boolean
  verifyDocument(documentId: string, actorName: string): void
  addAuditLog(applicationId: string, actor: string, action: string, metadata?: Record<string, string>): void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadInitialState)

  const getApplicationById = useCallback(
    (id: string) => state.applications.find((a) => a.id === id),
    [state.applications],
  )
  const getCustomerById = useCallback((id: string) => state.customers.find((c) => c.id === id), [state.customers])
  const getVehicleById = useCallback((id: string) => state.vehicles.find((v) => v.id === id), [state.vehicles])
  const getDealerById = useCallback((id: string) => DEALERS.find((d) => d.id === id), [])
  const getDocumentsForApplication = useCallback(
    (applicationId: string) => state.documents.filter((d) => d.applicationId === applicationId),
    [state.documents],
  )
  const getApprovalsForApplication = useCallback(
    (applicationId: string) => state.approvals.filter((a) => a.applicationId === applicationId),
    [state.approvals],
  )
  const getAuditLogsForApplication = useCallback(
    (applicationId: string) => state.auditLogs.filter((l) => l.applicationId === applicationId),
    [state.auditLogs],
  )

  const addAuditLog = useCallback(
    (applicationId: string, actor: string, action: string, metadata?: Record<string, string>) => {
      setState((prev) => {
        const auditLogs = [
          ...prev.auditLogs,
          { id: generateId('log'), applicationId, actor, action, timestamp: new Date().toISOString(), metadata },
        ]
        writeStorage(STORAGE_KEYS.auditLogs, auditLogs)
        return { ...prev, auditLogs }
      })
    },
    [],
  )

  const createApplication = useCallback((input: CreateApplicationInput): LoanApplication => {
    let created!: LoanApplication
    setState((prev) => {
      const customer: Customer = { ...input.customer, id: generateId('cust'), createdAt: new Date().toISOString() }
      const vehicle: Vehicle = { ...input.vehicle, id: generateId('veh') }
      const now = new Date().toISOString()
      created = {
        id: generateId('app'),
        code: generateApplicationCode(2026, prev.applications.length + 1),
        customerId: customer.id,
        vehicleId: vehicle.id,
        dealerId: input.dealerId,
        financing: input.financing,
        status: 'Draft',
        riskLevel: 'Medium',
        createdBy: input.createdBy,
        currentPIC: input.createdBy,
        createdAt: now,
        updatedAt: now,
      }
      const newDocuments: DocumentRecord[] = input.documents.map((doc, idx) => ({
        id: generateId(`doc-${idx}`),
        applicationId: created.id,
        type: doc.type,
        fileName: doc.fileName,
        status: doc.status,
        uploadedBy: doc.fileName ? input.createdBy : null,
        uploadedAt: doc.fileName ? now : null,
      }))
      const newLog: AuditLog = {
        id: generateId('log'),
        applicationId: created.id,
        actor: input.createdBy,
        action: 'Application created',
        timestamp: now,
      }

      const customers = [...prev.customers, customer]
      const vehicles = [...prev.vehicles, vehicle]
      const applications = [...prev.applications, created]
      const documents = [...prev.documents, ...newDocuments]
      const auditLogs = [...prev.auditLogs, newLog]

      writeStorage(STORAGE_KEYS.customers, customers)
      writeStorage(STORAGE_KEYS.vehicles, vehicles)
      writeStorage(STORAGE_KEYS.applications, applications)
      writeStorage(STORAGE_KEYS.documents, documents)
      writeStorage(STORAGE_KEYS.auditLogs, auditLogs)

      return { ...prev, customers, vehicles, applications, documents, auditLogs }
    })
    return created
  }, [])

  const transitionApplication = useCallback(
    (
      applicationId: string,
      nextStatus: ApplicationStatus,
      actor: { name: string; role: Role },
      notes?: string,
    ): boolean => {
      const application = state.applications.find((a) => a.id === applicationId)
      if (!application) return false
      if (!canTransition(application.status, nextStatus, actor.role)) return false

      const now = new Date().toISOString()
      setState((prev) => {
        const applications = prev.applications.map((a) =>
          a.id === applicationId ? { ...a, status: nextStatus, updatedAt: now, currentPIC: actor.name } : a,
        )
        const auditLogs = [
          ...prev.auditLogs,
          {
            id: generateId('log'),
            applicationId,
            actor: actor.name,
            action: `Status changed to ${nextStatus}${notes ? `: ${notes}` : ''}`,
            timestamp: now,
          },
        ]
        let approvals = prev.approvals
        if (
          application.status === 'Waiting Approval' &&
          (nextStatus === 'Approved' || nextStatus === 'Rejected' || nextStatus === 'Need Revision')
        ) {
          approvals = [
            ...prev.approvals,
            {
              id: generateId('apr'),
              applicationId,
              approver: actor.name,
              action: nextStatus === 'Approved' ? 'Approved' : nextStatus === 'Rejected' ? 'Rejected' : 'Revision Requested',
              notes: notes ?? '',
              timestamp: now,
            },
          ]
        }
        writeStorage(STORAGE_KEYS.applications, applications)
        writeStorage(STORAGE_KEYS.auditLogs, auditLogs)
        writeStorage(STORAGE_KEYS.approvals, approvals)
        return { ...prev, applications, auditLogs, approvals }
      })
      return true
    },
    [state.applications],
  )

  const verifyDocument = useCallback((documentId: string, actorName: string) => {
    setState((prev) => {
      const document = prev.documents.find((d) => d.id === documentId)
      if (!document) return prev
      const documents = prev.documents.map((d) => (d.id === documentId ? { ...d, status: 'Verified' as const } : d))
      const auditLogs = [
        ...prev.auditLogs,
        {
          id: generateId('log'),
          applicationId: document.applicationId,
          actor: actorName,
          action: `${document.type} verified`,
          timestamp: new Date().toISOString(),
        },
      ]
      writeStorage(STORAGE_KEYS.documents, documents)
      writeStorage(STORAGE_KEYS.auditLogs, auditLogs)
      return { ...prev, documents, auditLogs }
    })
  }, [])

  const value: DataContextValue = {
    customers: state.customers,
    dealers: DEALERS,
    vehicles: state.vehicles,
    applications: state.applications,
    documents: state.documents,
    approvals: state.approvals,
    auditLogs: state.auditLogs,
    getApplicationById,
    getCustomerById,
    getVehicleById,
    getDealerById,
    getDocumentsForApplication,
    getApprovalsForApplication,
    getAuditLogsForApplication,
    createApplication,
    transitionApplication,
    verifyDocument,
    addAuditLog,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
