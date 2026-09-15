import { ArrowRight, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MANUAL = [
  'Physical documents (KTP, SPK, forms)',
  'Repeated manual data entry',
  'Manual handoffs between roles',
  'Manual, paper-based approval',
  'Limited visibility into application status',
]

const DIGITAL = [
  'Digital application, entered once',
  'Single source of truth for customer & loan data',
  'Automated workflow routing by role',
  'Role-based digital approval',
  'Real-time status tracking and audit trail',
]

export function DigitalizationImpact() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Digitalization Impact</CardTitle>
        <p className="text-sm text-muted-foreground">From document-centric to digital workflow.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="space-y-2 rounded-lg bg-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Manual Process</p>
            <ul className="space-y-1.5">
              {MANUAL.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <X className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ArrowRight className="mx-auto hidden size-5 rotate-90 text-muted-foreground sm:block sm:rotate-0" />

          <div className="space-y-2 rounded-lg bg-success/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Digital Workflow</p>
            <ul className="space-y-1.5">
              {DIGITAL.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Expected improvements: reduced manual data entry and document handling, faster approval turnaround, better
          application visibility, improved traceability, and fewer operational errors.
        </p>
      </CardContent>
    </Card>
  )
}
