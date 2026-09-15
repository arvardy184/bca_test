import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { FileX2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import type { ApplicationStatus } from '@/types'
import { nextStatusesFor } from '@/utils/workflow'
import { formatCurrency, formatDate } from '@/utils/format'
import { maskNIK } from '@/utils/mask'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { WorkflowTimeline } from '@/components/applications/WorkflowTimeline'
import { ApprovalHistory } from '@/components/applications/ApprovalHistory'
import { AuditTrail } from '@/components/applications/AuditTrail'
import { DocumentChecklist } from '@/components/applications/DocumentChecklist'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const NOTES_REQUIRED: ApplicationStatus[] = ['Rejected', 'Need Revision']

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentUser } = useAuth()
  const {
    getApplicationById,
    getCustomerById,
    getVehicleById,
    getDealerById,
    getDocumentsForApplication,
    getApprovalsForApplication,
    getAuditLogsForApplication,
    transitionApplication,
    verifyDocument,
  } = useData()

  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null)
  const [notes, setNotes] = useState('')

  const application = id ? getApplicationById(id) : undefined

  if (!application || !currentUser) {
    return (
      <EmptyState
        icon={FileX2}
        title="Application not found"
        description="This application doesn't exist or may have been removed."
        action={{ label: 'Back to Applications', onClick: () => window.history.back() }}
      />
    )
  }

  const customer = getCustomerById(application.customerId)
  const vehicle = getVehicleById(application.vehicleId)
  const dealer = getDealerById(application.dealerId)
  const documents = getDocumentsForApplication(application.id)
  const approvals = getApprovalsForApplication(application.id)
  const auditLogs = getAuditLogsForApplication(application.id)
  const canVerify = ['marketing', 'marketing_supervisor', 'back_office'].includes(currentUser.role)
  const nextStatuses = nextStatusesFor(application.status, currentUser.role)

  function confirmTransition() {
    if (!pendingStatus || !currentUser) return
    const ok = transitionApplication(application!.id, pendingStatus, { name: currentUser.name, role: currentUser.role }, notes || undefined)
    if (ok) {
      toast.success(`Application moved to ${pendingStatus}.`)
    } else {
      toast.error('This transition is not allowed for your role.')
    }
    setPendingStatus(null)
    setNotes('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={['JKL CreditFlow', 'Applications', application.code]}
        title={`${application.code} — ${customer?.name ?? ''}`}
        subtitle={undefined}
        actions={<StatusBadge status={application.status} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Workflow Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowTimeline status={application.status} auditLogs={auditLogs} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Name" value={customer?.name ?? '-'} />
            <Row label="NIK" value={customer ? maskNIK(customer.nik) : '-'} />
            <Row label="Date of Birth" value={customer ? formatDate(customer.dob) : '-'} />
            <Row label="Marital Status" value={customer?.maritalStatus ?? '-'} />
            <Row label="Phone" value={customer?.phone ?? '-'} />
            <Row label="Occupation" value={customer?.occupation ?? '-'} />
            <Row label="Monthly Income" value={customer ? formatCurrency(customer.monthlyIncome) : '-'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Dealer" value={dealer?.name ?? '-'} />
            <Row label="Brand" value={vehicle?.brand ?? '-'} />
            <Row label="Model" value={vehicle?.model ?? '-'} />
            <Row label="Type" value={vehicle?.type ?? '-'} />
            <Row label="Color" value={vehicle?.color ?? '-'} />
            <Row label="Vehicle Price" value={vehicle ? formatCurrency(vehicle.price) : '-'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Vehicle Price" value={formatCurrency(application.financing.vehiclePrice)} />
            <Row label="Down Payment" value={formatCurrency(application.financing.downPayment)} />
            <Row label="Financed Amount" value={formatCurrency(application.financing.financedAmount)} />
            <Row label="Tenor" value={`${application.financing.tenor} months`} />
            <Row label="Insurance" value={formatCurrency(application.financing.insurance)} />
            <Row label="Estimated Monthly Installment" value={`${formatCurrency(application.financing.estimatedInstallment)} (Estimated)`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentChecklist
              documents={documents}
              canVerify={canVerify}
              onVerify={(docId) => {
                verifyDocument(docId, currentUser.name)
                toast.success('Document verified.')
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalHistory approvals={approvals} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditTrail logs={auditLogs} />
          </CardContent>
        </Card>
      </div>

      {nextStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <Button
                key={status}
                variant={status === 'Rejected' ? 'destructive' : status === 'Need Revision' ? 'outline' : 'default'}
                onClick={() => {
                  setNotes('')
                  setPendingStatus(status)
                }}
              >
                {status === 'Approved' && 'Approve'}
                {status === 'Rejected' && 'Reject'}
                {status === 'Need Revision' && 'Request Revision'}
                {!['Approved', 'Rejected', 'Need Revision'].includes(status) && `Move to ${status}`}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => !open && setPendingStatus(null)}
        title={pendingStatus === 'Approved' ? 'Approve Application?' : `Move to ${pendingStatus}?`}
        description={
          pendingStatus === 'Approved'
            ? `Application ${application.code} will move to document processing.`
            : `Application ${application.code} will be updated to "${pendingStatus}".`
        }
        confirmLabel={pendingStatus === 'Rejected' ? 'Reject' : pendingStatus === 'Approved' ? 'Approve' : 'Confirm'}
        confirmVariant={pendingStatus === 'Rejected' ? 'destructive' : 'default'}
        confirmDisabled={pendingStatus ? NOTES_REQUIRED.includes(pendingStatus) && !notes.trim() : false}
        onConfirm={confirmTransition}
      >
        {pendingStatus && NOTES_REQUIRED.includes(pendingStatus) && (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={pendingStatus === 'Rejected' ? 'Reason for rejection (required)' : 'Revision notes (required)'}
          />
        )}
      </ConfirmDialog>

      <Link to="/applications" className="text-sm text-primary hover:underline">
        ← Back to Applications
      </Link>
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
