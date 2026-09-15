import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { isValidEmail, isValidIncome, isValidNIK, isValidPhone } from '@/utils/validation'
import { calculateFinancing } from '@/utils/financing'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/common/PageHeader'
import { StepIndicator } from '@/components/wizard/StepIndicator'
import { StepCustomer } from '@/components/wizard/StepCustomer'
import { StepVehicle } from '@/components/wizard/StepVehicle'
import { StepFinancing } from '@/components/wizard/StepFinancing'
import { StepDocuments } from '@/components/wizard/StepDocuments'
import { StepReview } from '@/components/wizard/StepReview'
import { INITIAL_WIZARD_STATE, REQUIRED_DOCUMENTS, type WizardState } from '@/components/wizard/types'
import type { DocumentType } from '@/types'

const STEP_LABELS = ['Customer', 'Vehicle', 'Financing', 'Documents', 'Review']

export default function NewApplicationPage() {
  const { currentUser } = useAuth()
  const { createApplication, transitionApplication } = useData()
  const navigate = useNavigate()
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE)

  function validateStep1(): Record<string, string> {
    const errors: Record<string, string> = {}
    const c = state.customer
    if (!c.fullName.trim()) errors.fullName = 'Full name is required.'
    if (!isValidNIK(c.nik)) errors.nik = 'NIK must be exactly 16 digits.'
    if (!c.dob) errors.dob = 'Date of birth is required.'
    if (!isValidPhone(c.phone)) errors.phone = 'Enter a valid Indonesian phone number.'
    if (!isValidEmail(c.email)) errors.email = 'Enter a valid email address.'
    if (!c.address.trim()) errors.address = 'Address is required.'
    if (!c.occupation.trim()) errors.occupation = 'Occupation is required.'
    if (!isValidIncome(c.monthlyIncome)) errors.monthlyIncome = 'Monthly income must be a positive number.'
    if (c.maritalStatus === 'Married') {
      if (!c.spouseName.trim()) errors.spouseName = 'Spouse name is required.'
      if (!isValidNIK(c.spouseNik)) errors.spouseNik = "Spouse NIK must be exactly 16 digits."
      if (!c.spouseDob) errors.spouseDob = 'Spouse date of birth is required.'
    }
    return errors
  }

  function validateStep2(): Record<string, string> {
    const errors: Record<string, string> = {}
    const v = state.vehicle
    if (!v.dealerId) errors.dealerId = 'Select a dealer.'
    if (!v.brand) errors.brand = 'Select a brand.'
    if (!v.model) errors.model = 'Select a model.'
    if (!v.type) errors.type = 'Select a type.'
    if (!v.color) errors.color = 'Select a color.'
    if (!v.price || v.price <= 0) errors.price = 'Vehicle price must be greater than zero.'
    return errors
  }

  function validateStep3(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (state.financing.downPayment <= 0) errors.downPayment = 'Down payment is required.'
    if (state.financing.downPayment >= state.vehicle.price) {
      errors.downPayment = 'Down payment must be less than the vehicle price.'
    }
    return errors
  }

  function validateStep4(): Record<string, string> {
    const errors: Record<string, string> = {}
    const missing = REQUIRED_DOCUMENTS.filter((type) => state.documents[type].status !== 'Uploaded')
    if (missing.length > 0) errors.documents = `Please upload the following required documents: ${missing.join(', ')}.`
    return errors
  }

  function goNext() {
    let errors: Record<string, string> = {}
    if (state.step === 1) errors = validateStep1()
    if (state.step === 2) errors = validateStep2()
    if (state.step === 3) errors = validateStep3()
    if (state.step === 4) errors = validateStep4()

    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, errors }))
      return
    }
    setState((prev) => ({ ...prev, step: Math.min(5, prev.step + 1) as WizardState['step'], errors: {} }))
  }

  function goBack() {
    setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) as WizardState['step'] }))
  }

  function handleSubmit() {
    if (!currentUser) return
    const financing = calculateFinancing({
      vehiclePrice: state.vehicle.price,
      downPayment: state.financing.downPayment,
      tenor: state.financing.tenor,
      interestRate: state.financing.interestRate,
      insurance: state.financing.insurance,
    })

    const created = createApplication({
      customer: {
        name: state.customer.fullName,
        nik: state.customer.nik,
        dob: state.customer.dob,
        maritalStatus: state.customer.maritalStatus,
        spouse:
          state.customer.maritalStatus === 'Married'
            ? { name: state.customer.spouseName, nik: state.customer.spouseNik, dob: state.customer.spouseDob }
            : undefined,
        phone: state.customer.phone,
        email: state.customer.email,
        address: state.customer.address,
        occupation: state.customer.occupation,
        monthlyIncome: Number(state.customer.monthlyIncome),
      },
      vehicle: {
        brand: state.vehicle.brand,
        model: state.vehicle.model,
        type: state.vehicle.type,
        color: state.vehicle.color,
        price: state.vehicle.price,
      },
      dealerId: state.vehicle.dealerId,
      financing: {
        vehiclePrice: state.vehicle.price,
        downPayment: state.financing.downPayment,
        financedAmount: financing.financedAmount,
        tenor: state.financing.tenor,
        interestRate: state.financing.interestRate,
        insurance: state.financing.insurance,
        estimatedInstallment: financing.estimatedInstallment,
      },
      documents: (Object.keys(state.documents) as DocumentType[]).map((type) => ({
        type,
        fileName: state.documents[type].fileName,
        status: state.documents[type].status,
      })),
      createdBy: currentUser.name,
    })

    transitionApplication(created.id, 'Submitted', { name: currentUser.name, role: currentUser.role })
    toast.success(`Application ${created.code} submitted.`)
    navigate(`/applications/${created.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={['JKL CreditFlow', 'Applications', 'New']}
        title="New Application"
        subtitle="Input Once, Process Faster — complete all steps to submit a financing application."
      />

      <StepIndicator current={state.step} labels={STEP_LABELS} />

      {state.step === 1 && (
        <StepCustomer
          value={state.customer}
          errors={state.errors}
          onChange={(patch) => setState((prev) => ({ ...prev, customer: { ...prev.customer, ...patch } }))}
        />
      )}
      {state.step === 2 && (
        <StepVehicle
          value={state.vehicle}
          errors={state.errors}
          onChange={(patch) => setState((prev) => ({ ...prev, vehicle: { ...prev.vehicle, ...patch } }))}
        />
      )}
      {state.step === 3 && (
        <StepFinancing
          vehiclePrice={state.vehicle.price}
          value={state.financing}
          errors={state.errors}
          onChange={(patch) => setState((prev) => ({ ...prev, financing: { ...prev.financing, ...patch } }))}
        />
      )}
      {state.step === 4 && (
        <StepDocuments
          value={state.documents}
          errors={state.errors}
          onChange={(type, fileName) =>
            setState((prev) => ({
              ...prev,
              documents: { ...prev.documents, [type]: { fileName, status: 'Uploaded' } },
            }))
          }
        />
      )}
      {state.step === 5 && <StepReview state={state} />}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goBack} disabled={state.step === 1}>
          Back
        </Button>
        {state.step < 5 ? (
          <Button onClick={goNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Submit Application</Button>
        )}
      </div>
    </div>
  )
}
