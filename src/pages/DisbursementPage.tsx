import { useState } from 'react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import type { ApplicationStatus, LoanApplication } from '@/types'
import { formatCurrency } from '@/utils/format'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CONTRACT_LABEL: Record<ApplicationStatus, string> = {
  Draft: '-', Submitted: '-', 'Under Review': '-', 'Need Revision': '-', 'Waiting Approval': '-',
  Approved: 'Pending', Rejected: '-', 'Document Pending': 'In Progress', Signed: 'Complete',
  'Ready for Disbursement': 'Complete', Disbursed: 'Complete',
}
const DOCUMENT_LABEL: Record<ApplicationStatus, string> = {
  ...CONTRACT_LABEL, Approved: 'Pending', 'Document Pending': 'In Progress', Signed: 'Complete',
}
const SIGNATURE_LABEL: Record<ApplicationStatus, string> = {
  ...CONTRACT_LABEL, Approved: 'Pending', 'Document Pending': 'Pending', Signed: 'Signed',
}
const DISBURSEMENT_LABEL: Record<ApplicationStatus, string> = {
  ...CONTRACT_LABEL, 'Ready for Disbursement': 'Ready', Disbursed: 'Disbursed',
}

const NEXT_ACTION_LABEL: Partial<Record<ApplicationStatus, string>> = {
  Approved: 'Mark Documents Pending',
  'Document Pending': 'Mark Signed',
  Signed: 'Mark Ready for Disbursement',
}
const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  Approved: 'Document Pending',
  'Document Pending': 'Signed',
  Signed: 'Ready for Disbursement',
}

export default function DisbursementPage() {
  const { currentUser } = useAuth()
  const { applications, getCustomerById, transitionApplication } = useData()
  const [confirmApp, setConfirmApp] = useState<LoanApplication | null>(null)

  const ready = applications.filter((a) => a.status === 'Ready for Disbursement')
  const processing = applications.filter((a) => ['Approved', 'Document Pending', 'Signed'].includes(a.status))
  const completed = applications.filter((a) => a.status === 'Disbursed')

  function handleTransition(app: LoanApplication, status: ApplicationStatus) {
    if (!currentUser) return
    const ok = transitionApplication(app.id, status, { name: currentUser.name, role: currentUser.role })
    toast[ok ? 'success' : 'error'](ok ? `Application ${app.code} moved to ${status}.` : 'Action not allowed.')
  }

  function renderCard(app: LoanApplication) {
    const customer = getCustomerById(app.customerId)
    const nextStatus = NEXT_STATUS[app.status]
    return (
      <Card key={app.id}>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <Link to={`/applications/${app.id}`} className="font-medium text-foreground hover:underline">
              {app.code}
            </Link>
            <span className="text-sm text-muted-foreground">{formatCurrency(app.financing.vehiclePrice)}</span>
          </div>
          <p className="text-sm text-muted-foreground">{customer?.name}</p>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <StatusChip label="Contract" value={CONTRACT_LABEL[app.status]} />
            <StatusChip label="Documents" value={DOCUMENT_LABEL[app.status]} />
            <StatusChip label="Signature" value={SIGNATURE_LABEL[app.status]} />
            <StatusChip label="Disbursement" value={DISBURSEMENT_LABEL[app.status]} />
          </div>
          {app.status === 'Ready for Disbursement' ? (
            <Button className="w-full" onClick={() => setConfirmApp(app)}>
              Process Disbursement
            </Button>
          ) : (
            nextStatus && (
              <Button variant="outline" className="w-full" onClick={() => handleTransition(app, nextStatus)}>
                {NEXT_ACTION_LABEL[app.status]}
              </Button>
            )
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb={['JKL CreditFlow', 'Disbursement']} title="Disbursement" />

      <Tabs defaultValue="ready">
        <TabsList>
          <TabsTrigger value="ready">Ready for Disbursement ({ready.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({processing.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ready" className="mt-4">
          {ready.length === 0 ? (
            <EmptyState icon={Wallet} title="Nothing to disburse" description="No applications are ready for disbursement right now." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ready.map(renderCard)}</div>
          )}
        </TabsContent>
        <TabsContent value="processing" className="mt-4">
          {processing.length === 0 ? (
            <EmptyState icon={Wallet} title="Nothing in progress" description="No applications are currently being processed." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{processing.map(renderCard)}</div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {completed.length === 0 ? (
            <EmptyState icon={Wallet} title="No disbursements yet" description="Completed disbursements will appear here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{completed.map(renderCard)}</div>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmApp !== null}
        onOpenChange={(open) => !open && setConfirmApp(null)}
        title="Process Disbursement?"
        description={`Application ${confirmApp?.code} will be marked as Disbursed.`}
        confirmLabel="Process Disbursement"
        onConfirm={() => {
          if (confirmApp) handleTransition(confirmApp, 'Disbursed')
          setConfirmApp(null)
        }}
      />
    </div>
  )
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/60 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}
