import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/format'
import { calculateFinancing } from '@/utils/financing'
import { maskNIK } from '@/utils/mask'
import { DEALERS } from '@/data/dealers'
import { DOCUMENT_TYPES, type WizardState } from './types'

export function StepReview({ state }: { state: WizardState }) {
  const dealer = DEALERS.find((d) => d.id === state.vehicle.dealerId)
  const { financedAmount, estimatedInstallment } = calculateFinancing({
    vehiclePrice: state.vehicle.price,
    downPayment: state.financing.downPayment,
    tenor: state.financing.tenor,
    interestRate: state.financing.interestRate,
    insurance: state.financing.insurance,
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1.5 text-sm sm:grid-cols-2">
          <Row label="Full Name" value={state.customer.fullName} />
          <Row label="NIK" value={maskNIK(state.customer.nik)} />
          <Row label="Marital Status" value={state.customer.maritalStatus} />
          <Row label="Phone" value={state.customer.phone} />
          <Row label="Occupation" value={state.customer.occupation} />
          <Row label="Monthly Income" value={formatCurrency(Number(state.customer.monthlyIncome) || 0)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1.5 text-sm sm:grid-cols-2">
          <Row label="Dealer" value={dealer?.name ?? '-'} />
          <Row label="Vehicle" value={`${state.vehicle.brand} ${state.vehicle.model} ${state.vehicle.type}`} />
          <Row label="Color" value={state.vehicle.color} />
          <Row label="Price" value={formatCurrency(state.vehicle.price)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1.5 text-sm sm:grid-cols-2">
          <Row label="Down Payment" value={formatCurrency(state.financing.downPayment)} />
          <Row label="Financed Amount" value={formatCurrency(financedAmount)} />
          <Row label="Tenor" value={`${state.financing.tenor} months`} />
          <Row label="Estimated Installment" value={`${formatCurrency(estimatedInstallment)} / month`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1.5 text-sm sm:grid-cols-2">
          {DOCUMENT_TYPES.map((type) => (
            <Row key={type} label={type} value={state.documents[type].status} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
