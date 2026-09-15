import type {
  ApplicationStatus,
  Approval,
  AuditLog,
  DocumentRecord,
  DocumentType,
  LoanApplication,
  RiskLevel,
  Vehicle,
} from '@/types'
import { calculateFinancing } from '@/utils/financing'
import { generateApplicationCode } from '@/utils/id'
import { DEMO_USERS } from './users'

const DOCUMENT_TYPES: DocumentType[] = ['KTP', 'Kartu Keluarga', 'SPK', 'Bukti Bayar Tanda Jadi', 'Form Aplikasi']

interface RawApplication {
  seq: number
  customerId: string
  vehicle: Omit<Vehicle, 'id'>
  dealerId: string
  status: ApplicationStatus
  riskLevel: RiskLevel
  downPaymentRatio: number
  tenor: number
  interestRate: number
  insuranceRatio: number
  createdAt: string
  updatedAt: string
}

const RAW: RawApplication[] = [
  {
    seq: 128, customerId: 'cust-1', dealerId: 'dealer-3', status: 'Waiting Approval', riskLevel: 'Medium',
    vehicle: { brand: 'Toyota', model: 'Avanza', type: '1.5 Veloz CVT', color: 'White', price: 235_000_000 },
    downPaymentRatio: 0.2, tenor: 60, interestRate: 6.5, insuranceRatio: 0.03,
    createdAt: '2026-09-15T09:12:00.000Z', updatedAt: '2026-09-15T10:30:00.000Z',
  },
  {
    seq: 127, customerId: 'cust-2', dealerId: 'dealer-1', status: 'Under Review', riskLevel: 'Low',
    vehicle: { brand: 'Honda', model: 'Brio', type: 'RS CVT', color: 'Black', price: 175_000_000 },
    downPaymentRatio: 0.2, tenor: 36, interestRate: 6, insuranceRatio: 0.03,
    createdAt: '2026-09-15T08:40:00.000Z', updatedAt: '2026-09-15T10:05:00.000Z',
  },
  {
    seq: 126, customerId: 'cust-3', dealerId: 'dealer-2', status: 'Approved', riskLevel: 'Low',
    vehicle: { brand: 'Mitsubishi', model: 'Xpander', type: 'Ultimate CVT', color: 'Silver', price: 260_000_000 },
    downPaymentRatio: 0.25, tenor: 48, interestRate: 6.5, insuranceRatio: 0.03,
    createdAt: '2026-09-14T09:00:00.000Z', updatedAt: '2026-09-14T15:20:00.000Z',
  },
  {
    seq: 125, customerId: 'cust-4', dealerId: 'dealer-1', status: 'Draft', riskLevel: 'Medium',
    vehicle: { brand: 'Suzuki', model: 'Ertiga', type: 'GL MT', color: 'Gray', price: 230_000_000 },
    downPaymentRatio: 0.2, tenor: 36, interestRate: 6.5, insuranceRatio: 0.03,
    createdAt: '2026-09-15T11:00:00.000Z', updatedAt: '2026-09-15T11:00:00.000Z',
  },
  {
    seq: 124, customerId: 'cust-5', dealerId: 'dealer-3', status: 'Submitted', riskLevel: 'Medium',
    vehicle: { brand: 'Daihatsu', model: 'Terios', type: 'X MT', color: 'Red', price: 255_000_000 },
    downPaymentRatio: 0.2, tenor: 48, interestRate: 6.5, insuranceRatio: 0.03,
    createdAt: '2026-09-15T07:30:00.000Z', updatedAt: '2026-09-15T07:30:00.000Z',
  },
  {
    seq: 123, customerId: 'cust-6', dealerId: 'dealer-2', status: 'Need Revision', riskLevel: 'High',
    vehicle: { brand: 'Toyota', model: 'Innova', type: '2.0 G MT', color: 'White', price: 415_000_000 },
    downPaymentRatio: 0.25, tenor: 60, interestRate: 7, insuranceRatio: 0.03,
    createdAt: '2026-09-13T09:00:00.000Z', updatedAt: '2026-09-13T14:10:00.000Z',
  },
  {
    seq: 122, customerId: 'cust-7', dealerId: 'dealer-1', status: 'Rejected', riskLevel: 'High',
    vehicle: { brand: 'Honda', model: 'HR-V', type: '1.5 E CVT', color: 'Black', price: 385_000_000 },
    downPaymentRatio: 0.15, tenor: 60, interestRate: 7.5, insuranceRatio: 0.03,
    createdAt: '2026-09-10T09:00:00.000Z', updatedAt: '2026-09-11T10:00:00.000Z',
  },
  {
    seq: 121, customerId: 'cust-8', dealerId: 'dealer-3', status: 'Document Pending', riskLevel: 'Low',
    vehicle: { brand: 'Toyota', model: 'Avanza', type: '1.3 G MT', color: 'Silver', price: 235_000_000 },
    downPaymentRatio: 0.2, tenor: 36, interestRate: 6, insuranceRatio: 0.03,
    createdAt: '2026-09-08T09:00:00.000Z', updatedAt: '2026-09-12T09:00:00.000Z',
  },
  {
    seq: 120, customerId: 'cust-9', dealerId: 'dealer-2', status: 'Signed', riskLevel: 'Medium',
    vehicle: { brand: 'Mitsubishi', model: 'Xpander', type: 'GLS MT', color: 'White', price: 260_000_000 },
    downPaymentRatio: 0.2, tenor: 36, interestRate: 6.5, insuranceRatio: 0.03,
    createdAt: '2026-09-06T09:00:00.000Z', updatedAt: '2026-09-12T09:00:00.000Z',
  },
  {
    seq: 119, customerId: 'cust-10', dealerId: 'dealer-1', status: 'Ready for Disbursement', riskLevel: 'Low',
    vehicle: { brand: 'Suzuki', model: 'Ertiga', type: 'Hybrid GX', color: 'Black', price: 230_000_000 },
    downPaymentRatio: 0.25, tenor: 24, interestRate: 6, insuranceRatio: 0.03,
    createdAt: '2026-09-04T09:00:00.000Z', updatedAt: '2026-09-13T09:00:00.000Z',
  },
  {
    seq: 118, customerId: 'cust-11', dealerId: 'dealer-3', status: 'Disbursed', riskLevel: 'Low',
    vehicle: { brand: 'Daihatsu', model: 'Terios', type: 'R CVT', color: 'Red', price: 255_000_000 },
    downPaymentRatio: 0.2, tenor: 36, interestRate: 6.5, insuranceRatio: 0.03,
    createdAt: '2026-09-01T09:00:00.000Z', updatedAt: '2026-09-10T09:00:00.000Z',
  },
  {
    seq: 117, customerId: 'cust-12', dealerId: 'dealer-2', status: 'Submitted', riskLevel: 'Medium',
    vehicle: { brand: 'Honda', model: 'Brio', type: 'Satya E MT', color: 'Gray', price: 175_000_000 },
    downPaymentRatio: 0.2, tenor: 24, interestRate: 6, insuranceRatio: 0.03,
    createdAt: '2026-09-14T13:00:00.000Z', updatedAt: '2026-09-14T13:00:00.000Z',
  },
  {
    seq: 116, customerId: 'cust-13', dealerId: 'dealer-1', status: 'Waiting Approval', riskLevel: 'High',
    vehicle: { brand: 'Toyota', model: 'Innova', type: 'Zenix Hybrid', color: 'Silver', price: 415_000_000 },
    downPaymentRatio: 0.25, tenor: 60, interestRate: 7, insuranceRatio: 0.03,
    createdAt: '2026-09-12T09:00:00.000Z', updatedAt: '2026-09-14T09:30:00.000Z',
  },
  {
    seq: 115, customerId: 'cust-14', dealerId: 'dealer-3', status: 'Under Review', riskLevel: 'Medium',
    vehicle: { brand: 'Honda', model: 'HR-V', type: 'RS Turbo', color: 'White', price: 385_000_000 },
    downPaymentRatio: 0.2, tenor: 48, interestRate: 6.5, insuranceRatio: 0.03,
    createdAt: '2026-09-13T09:00:00.000Z', updatedAt: '2026-09-14T11:00:00.000Z',
  },
]

const SALES = DEMO_USERS.sales_dealer.name
const MARKETING = DEMO_USERS.marketing.name
const SUPERVISOR = DEMO_USERS.marketing_supervisor.name
const BACK_OFFICE = DEMO_USERS.back_office.name

function currentPICFor(status: ApplicationStatus): string {
  if (status === 'Draft' || status === 'Submitted') return SALES
  if (status === 'Under Review' || status === 'Need Revision') return MARKETING
  if (status === 'Waiting Approval') return SUPERVISOR
  if (status === 'Rejected') return SUPERVISOR
  return BACK_OFFICE
}

function documentStatusesFor(status: ApplicationStatus): Partial<Record<DocumentType, DocumentRecord['status']>> {
  if (status === 'Draft') {
    return {
      KTP: 'Uploaded',
      'Form Aplikasi': 'Uploaded',
      'Kartu Keluarga': 'Missing',
      SPK: 'Missing',
      'Bukti Bayar Tanda Jadi': 'Missing',
    }
  }
  if (status === 'Submitted' || status === 'Under Review') {
    return {
      KTP: 'Under Verification',
      'Kartu Keluarga': 'Under Verification',
      SPK: 'Under Verification',
      'Bukti Bayar Tanda Jadi': 'Under Verification',
      'Form Aplikasi': 'Under Verification',
    }
  }
  if (status === 'Need Revision') {
    return {
      KTP: 'Verified',
      'Kartu Keluarga': 'Verified',
      SPK: 'Verified',
      'Bukti Bayar Tanda Jadi': 'Rejected',
      'Form Aplikasi': 'Verified',
    }
  }
  if (status === 'Rejected') {
    return {
      KTP: 'Verified',
      'Kartu Keluarga': 'Verified',
      SPK: 'Rejected',
      'Bukti Bayar Tanda Jadi': 'Verified',
      'Form Aplikasi': 'Verified',
    }
  }
  return {
    KTP: 'Verified',
    'Kartu Keluarga': 'Verified',
    SPK: 'Verified',
    'Bukti Bayar Tanda Jadi': 'Verified',
    'Form Aplikasi': 'Verified',
  }
}

const vehicles: Vehicle[] = []
const applications: LoanApplication[] = []
const documents: DocumentRecord[] = []
const approvals: Approval[] = []
const auditLogs: AuditLog[] = []

RAW.forEach((raw) => {
  const vehicleId = `veh-${raw.seq}`
  vehicles.push({ id: vehicleId, ...raw.vehicle })

  const financing = calculateFinancing({
    vehiclePrice: raw.vehicle.price,
    downPayment: Math.round(raw.vehicle.price * raw.downPaymentRatio),
    tenor: raw.tenor,
    interestRate: raw.interestRate,
    insurance: Math.round(raw.vehicle.price * raw.insuranceRatio),
  })

  const applicationId = `app-${raw.seq}`
  applications.push({
    id: applicationId,
    code: generateApplicationCode(2026, raw.seq),
    customerId: raw.customerId,
    vehicleId,
    dealerId: raw.dealerId,
    financing: {
      vehiclePrice: raw.vehicle.price,
      downPayment: Math.round(raw.vehicle.price * raw.downPaymentRatio),
      financedAmount: financing.financedAmount,
      tenor: raw.tenor,
      interestRate: raw.interestRate,
      insurance: Math.round(raw.vehicle.price * raw.insuranceRatio),
      estimatedInstallment: financing.estimatedInstallment,
    },
    status: raw.status,
    riskLevel: raw.riskLevel,
    createdBy: SALES,
    currentPIC: currentPICFor(raw.status),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  })

  const docStatuses = documentStatusesFor(raw.status)
  DOCUMENT_TYPES.forEach((type, idx) => {
    const docStatus = docStatuses[type] ?? 'Missing'
    documents.push({
      id: `doc-${raw.seq}-${idx}`,
      applicationId,
      type,
      fileName: docStatus === 'Missing' ? null : `${type.replace(/\s+/g, '_')}_${raw.customerId}.pdf`,
      status: docStatus,
      uploadedBy: docStatus === 'Missing' ? null : SALES,
      uploadedAt: docStatus === 'Missing' ? null : raw.createdAt,
    })
  })

  const decidedStatuses: ApplicationStatus[] = [
    'Approved', 'Rejected', 'Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed',
  ]
  if (decidedStatuses.includes(raw.status)) {
    approvals.push({
      id: `apr-${raw.seq}`,
      applicationId,
      approver: SUPERVISOR,
      action: raw.status === 'Rejected' ? 'Rejected' : 'Approved',
      notes: raw.status === 'Rejected' ? 'Dokumen SPK tidak sesuai dengan data kendaraan.' : 'Dokumen lengkap dan sesuai kebijakan kredit.',
      timestamp: raw.status === 'Rejected' ? raw.updatedAt : raw.createdAt,
    })
  }

  auditLogs.push({
    id: `log-${raw.seq}-1`,
    applicationId,
    actor: SALES,
    action: 'Application created',
    timestamp: raw.createdAt,
  })
  DOCUMENT_TYPES.forEach((type, idx) => {
    const docStatus = docStatuses[type] ?? 'Missing'
    if (docStatus !== 'Missing') {
      auditLogs.push({
        id: `log-${raw.seq}-doc-${idx}`,
        applicationId,
        actor: SALES,
        action: `${type} uploaded`,
        timestamp: raw.createdAt,
      })
    }
  })

  const reachedReview: ApplicationStatus[] = [
    'Under Review', 'Need Revision', 'Waiting Approval', 'Approved', 'Rejected',
    'Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed',
  ]
  if (reachedReview.includes(raw.status)) {
    auditLogs.push({
      id: `log-${raw.seq}-review`,
      applicationId,
      actor: MARKETING,
      action: 'Application reviewed',
      timestamp: raw.createdAt,
    })
  }
  if (raw.status === 'Need Revision') {
    auditLogs.push({
      id: `log-${raw.seq}-revision`,
      applicationId,
      actor: MARKETING,
      action: 'Revision requested: Bukti Bayar Tanda Jadi needs to be re-uploaded',
      timestamp: raw.updatedAt,
    })
  }
  const reachedApproval: ApplicationStatus[] = [
    'Waiting Approval', 'Approved', 'Rejected', 'Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed',
  ]
  if (reachedApproval.includes(raw.status)) {
    auditLogs.push({
      id: `log-${raw.seq}-submit-approval`,
      applicationId,
      actor: MARKETING,
      action: 'Submitted for approval',
      timestamp: raw.createdAt,
    })
    if (raw.status === 'Waiting Approval') {
      auditLogs.push({
        id: `log-${raw.seq}-waiting`,
        applicationId,
        actor: SUPERVISOR,
        action: 'Waiting for supervisor approval',
        timestamp: raw.updatedAt,
      })
    }
  }
  if (raw.status === 'Approved' || decidedStatuses.includes(raw.status)) {
    auditLogs.push({
      id: `log-${raw.seq}-decision`,
      applicationId,
      actor: SUPERVISOR,
      action: raw.status === 'Rejected' ? 'Application rejected' : 'Application approved',
      timestamp: raw.status === 'Rejected' ? raw.updatedAt : raw.createdAt,
    })
  }
  const backOfficeStages: ApplicationStatus[] = ['Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed']
  if (backOfficeStages.includes(raw.status)) {
    auditLogs.push({
      id: `log-${raw.seq}-docprocessing`,
      applicationId,
      actor: BACK_OFFICE,
      action: 'Document processing started',
      timestamp: raw.createdAt,
    })
  }
  if (['Signed', 'Ready for Disbursement', 'Disbursed'].includes(raw.status)) {
    auditLogs.push({
      id: `log-${raw.seq}-signed`,
      applicationId,
      actor: BACK_OFFICE,
      action: 'Contract signed',
      timestamp: raw.createdAt,
    })
  }
  if (['Ready for Disbursement', 'Disbursed'].includes(raw.status)) {
    auditLogs.push({
      id: `log-${raw.seq}-ready`,
      applicationId,
      actor: BACK_OFFICE,
      action: 'Ready for disbursement',
      timestamp: raw.updatedAt,
    })
  }
  if (raw.status === 'Disbursed') {
    auditLogs.push({
      id: `log-${raw.seq}-disbursed`,
      applicationId,
      actor: BACK_OFFICE,
      action: 'Disbursement processed',
      timestamp: raw.updatedAt,
    })
  }
})

export const SEED_VEHICLES = vehicles
export const SEED_APPLICATIONS = applications
export const SEED_DOCUMENTS = documents
export const SEED_APPROVALS = approvals
export const SEED_AUDIT_LOGS = auditLogs
