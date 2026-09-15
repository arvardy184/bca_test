import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { WizardCustomer } from './types'

export function StepCustomer({
  value,
  errors,
  onChange,
}: {
  value: WizardCustomer
  errors: Record<string, string>
  onChange: (patch: Partial<WizardCustomer>) => void
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" error={errors.fullName}>
            <Input value={value.fullName} onChange={(e) => onChange({ fullName: e.target.value })} />
          </Field>
          <Field label="NIK" error={errors.nik}>
            <Input
              value={value.nik}
              maxLength={16}
              onChange={(e) => onChange({ nik: e.target.value.replace(/\D/g, '') })}
              placeholder="16-digit NIK"
            />
          </Field>
          <Field label="Date of Birth" error={errors.dob}>
            <Input type="date" value={value.dob} onChange={(e) => onChange({ dob: e.target.value })} />
          </Field>
          <Field label="Marital Status" error={errors.maritalStatus}>
            <Select
              value={value.maritalStatus}
              onValueChange={(v) => onChange({ maritalStatus: v as WizardCustomer['maritalStatus'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phone Number" error={errors.phone}>
            <Input
              value={value.phone}
              onChange={(e) => onChange({ phone: e.target.value.replace(/[^\d+]/g, '') })}
              placeholder="0812xxxxxxxx"
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input type="email" value={value.email} onChange={(e) => onChange({ email: e.target.value })} />
          </Field>
          <Field label="Address" error={errors.address} className="sm:col-span-2">
            <Input value={value.address} onChange={(e) => onChange({ address: e.target.value })} />
          </Field>
          <Field label="Occupation" error={errors.occupation}>
            <Input value={value.occupation} onChange={(e) => onChange({ occupation: e.target.value })} />
          </Field>
          <Field label="Monthly Income (Rp)" error={errors.monthlyIncome}>
            <Input
              value={value.monthlyIncome}
              onChange={(e) => onChange({ monthlyIncome: e.target.value.replace(/\D/g, '') })}
              placeholder="8000000"
            />
          </Field>
        </CardContent>
      </Card>

      {value.maritalStatus === 'Married' && (
        <Card>
          <CardHeader>
            <CardTitle>Spouse Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Spouse Name" error={errors.spouseName}>
              <Input value={value.spouseName} onChange={(e) => onChange({ spouseName: e.target.value })} />
            </Field>
            <Field label="Spouse NIK" error={errors.spouseNik}>
              <Input
                value={value.spouseNik}
                maxLength={16}
                onChange={(e) => onChange({ spouseNik: e.target.value.replace(/\D/g, '') })}
              />
            </Field>
            <Field label="Spouse Date of Birth" error={errors.spouseDob}>
              <Input type="date" value={value.spouseDob} onChange={(e) => onChange({ spouseDob: e.target.value })} />
            </Field>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
