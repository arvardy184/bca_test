import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ClipboardCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import type { ApplicationStatus, LoanApplication } from '@/types'
import { formatCurrency } from '@/utils/format'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskBadge } from '@/components/common/RiskBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function slaHours(updatedAt: string): number {
  return Math.round((Date.now() - new Date(updatedAt).getTime()) / 36e5)
}

const NOTES_REQUIRED: ApplicationStatus[] = ['Rejected', 'Need Revision']

export default function ApprovalQueuePage() {
  const { currentUser } = useAuth()
  const { applications, getCustomerById, getDealerById, transitionApplication } = useData()
  const [selected, setSelected] = useState<LoanApplication | null>(null)
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null)
  const [notes, setNotes] = useState('')

  const queue = applications.filter((a) => a.status === 'Waiting Approval')

  function openAction(app: LoanApplication, status: ApplicationStatus) {
    setSelected(app)
    setPendingStatus(status)
    setNotes('')
  }

  function confirm() {
    if (!selected || !pendingStatus || !currentUser) return
    const ok = transitionApplication(selected.id, pendingStatus, { name: currentUser.name, role: currentUser.role }, notes || undefined)
    toast[ok ? 'success' : 'error'](ok ? `Application ${selected.code} moved to ${pendingStatus}.` : 'Action not allowed.')
    setSelected(null)
    setPendingStatus(null)
    setNotes('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={['JKL CreditFlow', 'Approval Queue']}
        title="Approval Queue"
        subtitle="Review applications requiring your approval."
      />

      {queue.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No applications waiting"
          description="There are currently no applications waiting for your approval."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Risk Indicator</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((app) => {
                const hours = slaHours(app.updatedAt)
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <Link to={`/applications/${app.id}`} className="hover:underline">
                        {app.code}
                      </Link>
                    </TableCell>
                    <TableCell>{getCustomerById(app.customerId)?.name}</TableCell>
                    <TableCell>{getDealerById(app.dealerId)?.name}</TableCell>
                    <TableCell>{formatCurrency(app.financing.vehiclePrice)}</TableCell>
                    <TableCell>
                      <RiskBadge level={app.riskLevel} />
                    </TableCell>
                    <TableCell className={hours > 24 ? 'text-destructive' : 'text-success'}>{hours}h</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openAction(app, 'Need Revision')}>
                          Request Revision
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openAction(app, 'Rejected')}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => openAction(app, 'Approved')}>
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={selected !== null && pendingStatus !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={pendingStatus === 'Approved' ? 'Approve Application?' : `${pendingStatus} Application?`}
        description={
          pendingStatus === 'Approved'
            ? `Application ${selected?.code} will move to Document Processing.`
            : `Application ${selected?.code} will be updated to "${pendingStatus}".`
        }
        confirmLabel={pendingStatus === 'Rejected' ? 'Reject' : pendingStatus === 'Approved' ? 'Approve' : 'Confirm'}
        confirmVariant={pendingStatus === 'Rejected' ? 'destructive' : 'default'}
        confirmDisabled={pendingStatus ? NOTES_REQUIRED.includes(pendingStatus) && !notes.trim() : false}
        onConfirm={confirm}
      >
        {pendingStatus && NOTES_REQUIRED.includes(pendingStatus) && (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={pendingStatus === 'Rejected' ? 'Reason for rejection (required)' : 'Revision notes (required)'}
          />
        )}
      </ConfirmDialog>
    </div>
  )
}
