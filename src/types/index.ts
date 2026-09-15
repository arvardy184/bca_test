export type Role = 'sales_dealer' | 'marketing' | 'marketing_supervisor' | 'back_office'

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Need Revision'
  | 'Waiting Approval'
  | 'Approved'
  | 'Rejected'
  | 'Document Pending'
  | 'Signed'
  | 'Ready for Disbursement'
  | 'Disbursed'

export type RiskLevel = 'Low' | 'Medium' | 'High'
export type MaritalStatus = 'Single' | 'Married'

export interface User {
  id: string
  name: string
  role: Role
  initials: string
}

export interface Spouse {
  name: string
  nik: string
  dob: string
}

export interface Customer {
  id: string
  name: string
  nik: string
  dob: string
  maritalStatus: MaritalStatus
  spouse?: Spouse
  phone: string
  email: string
  address: string
  occupation: string
  monthlyIncome: number
  createdAt: string
}

export interface Dealer {
  id: string
  name: string
  city: string
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  type: string
  color: string
  price: number
}

export interface Financing {
  vehiclePrice: number
  downPayment: number
  financedAmount: number
  tenor: number
  interestRate: number
  insurance: number
  estimatedInstallment: number
}

export type DocumentType = 'KTP' | 'Kartu Keluarga' | 'SPK' | 'Bukti Bayar Tanda Jadi' | 'Form Aplikasi'
export type DocumentStatus = 'Missing' | 'Uploaded' | 'Under Verification' | 'Verified' | 'Rejected'

export interface DocumentRecord {
  id: string
  applicationId: string
  type: DocumentType
  fileName: string | null
  status: DocumentStatus
  uploadedBy: string | null
  uploadedAt: string | null
}

export interface Approval {
  id: string
  applicationId: string
  approver: string
  action: 'Approved' | 'Rejected' | 'Revision Requested'
  notes: string
  timestamp: string
}

export interface AuditLog {
  id: string
  applicationId: string
  actor: string
  action: string
  timestamp: string
  metadata?: Record<string, string>
}

export interface LoanApplication {
  id: string
  code: string
  customerId: string
  vehicleId: string
  dealerId: string
  financing: Financing
  status: ApplicationStatus
  riskLevel: RiskLevel
  createdBy: string
  currentPIC: string
  createdAt: string
  updatedAt: string
}
