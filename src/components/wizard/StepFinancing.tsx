import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateFinancing } from '@/utils/financing'
import { formatCurrency } from '@/utils/format'
import type { WizardFinancing } from './types'

const TENORS = [12, 24, 36, 48, 60]

export function StepFinancing({
  vehiclePrice,
  value,
  errors,
  onChange,
}: {
  vehiclePrice: number
  value: WizardFinancing
  errors: Record<string, string>
  onChange: (patch: Partial<WizardFinancing>) => void
}) {
  const { financedAmount, estimatedInstallment } = calculateFinancing({
    vehiclePrice,
    downPayment: value.downPayment,
    tenor: value.tenor,
    interestRate: value.interestRate,
    insurance: value.insurance,
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Financing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Insurance (Rp)</Label>
            <Input
              value={value.insurance || ''}
              onChange={(e) => onChange({ insurance: Number(e.target.value.replace(/\D/g, '')) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Down Payment (Rp)</Label>
            <Input
              value={value.downPayment || ''}
              onChange={(e) => onChange({ downPayment: Number(e.target.value.replace(/\D/g, '')) || 0 })}
            />
            {errors.downPayment && <p className="text-xs text-destructive">{errors.downPayment}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Tenor</Label>
            <Select value={String(value.tenor)} onValueChange={(v) => onChange({ tenor: Number(v) })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TENORS.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t} months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Interest Rate (% per year, flat)</Label>
            <Input
              type="number"
              step="0.1"
              value={value.interestRate}
              onChange={(e) => onChange({ interestRate: Number(e.target.value) || 0 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Vehicle Price" value={formatCurrency(vehiclePrice)} />
          <Row label="Down Payment" value={formatCurrency(value.downPayment)} />
          <Row label="Financed Amount" value={formatCurrency(financedAmount)} />
          <Row label="Tenor" value={`${value.tenor} months`} />
          <Row label="Estimated Installment" value={`${formatCurrency(estimatedInstallment)} / month`} emphasize />
          <p className="pt-1 text-xs text-muted-foreground">
            &quot;Estimated&quot; — for illustration only, not an official amortization schedule.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? 'text-base font-semibold text-foreground' : 'font-medium text-foreground'}>
        {value}
      </span>
    </div>
  )
}
