import type { DocumentType, MaritalStatus } from '@/types'

export interface WizardCustomer {
  fullName: string
  nik: string
  dob: string
  maritalStatus: MaritalStatus
  phone: string
  email: string
  address: string
  occupation: string
  monthlyIncome: string
  spouseName: string
  spouseNik: string
  spouseDob: string
}

export interface WizardVehicle {
  dealerId: string
  brand: string
  model: string
  type: string
  color: string
  price: number
}

export interface WizardFinancing {
  insurance: number
  downPayment: number
  tenor: number
  interestRate: number
}

export type WizardDocumentState = Record<DocumentType, { fileName: string | null; status: 'Missing' | 'Uploaded' }>

export interface WizardState {
  step: 1 | 2 | 3 | 4 | 5
  customer: WizardCustomer
  vehicle: WizardVehicle
  financing: WizardFinancing
  documents: WizardDocumentState
  errors: Record<string, string>
}

export const DOCUMENT_TYPES: DocumentType[] = ['KTP', 'Kartu Keluarga', 'SPK', 'Bukti Bayar Tanda Jadi', 'Form Aplikasi']

export const REQUIRED_DOCUMENTS: DocumentType[] = ['KTP', 'Form Aplikasi']

export const INITIAL_WIZARD_STATE: WizardState = {
  step: 1,
  customer: {
    fullName: '', nik: '', dob: '', maritalStatus: 'Single', phone: '', email: '', address: '',
    occupation: '', monthlyIncome: '', spouseName: '', spouseNik: '', spouseDob: '',
  },
  vehicle: { dealerId: '', brand: '', model: '', type: '', color: '', price: 0 },
  financing: { insurance: 0, downPayment: 0, tenor: 36, interestRate: 6.5 },
  documents: DOCUMENT_TYPES.reduce((acc, type) => {
    acc[type] = { fileName: null, status: 'Missing' }
    return acc
  }, {} as WizardDocumentState),
  errors: {},
}
