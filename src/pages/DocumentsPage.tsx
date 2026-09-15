import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileStack } from 'lucide-react'
import { useData } from '@/context/DataContext'
import type { DocumentStatus, DocumentType } from '@/types'
import { DOCUMENT_TYPES } from '@/components/wizard/types'
import { maskNIK } from '@/utils/mask'
import { formatDateTime } from '@/utils/format'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DOCUMENT_STATUSES: DocumentStatus[] = ['Missing', 'Uploaded', 'Under Verification', 'Verified', 'Rejected']

export default function DocumentsPage() {
  const { documents, applications, getCustomerById } = useData()
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')
  const [appFilter, setAppFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all')

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (typeFilter !== 'all' && doc.type !== typeFilter) return false
      if (appFilter !== 'all' && doc.applicationId !== appFilter) return false
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false
      return true
    })
  }, [documents, typeFilter, appFilter, statusFilter])

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb={['JKL CreditFlow', 'Documents']} title="Document Center" />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DocumentType | 'all')}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={appFilter} onValueChange={setAppFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Application" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            {applications.map((app) => (
              <SelectItem key={app.id} value={app.id}>
                {app.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DocumentStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Verification Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {DOCUMENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileStack} title="No documents found" description="Try adjusting your filters." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => {
            const app = applications.find((a) => a.id === doc.applicationId)
            const customer = app ? getCustomerById(app.customerId) : undefined
            return (
              <Card key={doc.id}>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{doc.type}</p>
                    <StatusBadge status={doc.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.fileName ?? 'No file uploaded'}</p>
                  {app && (
                    <Link to={`/applications/${app.id}`} className="block text-xs text-primary hover:underline">
                      {app.code}
                    </Link>
                  )}
                  {customer && (
                    <p className="text-xs text-muted-foreground">
                      {customer.name} — {maskNIK(customer.nik)}
                    </p>
                  )}
                  {doc.uploadedAt && <p className="text-[11px] text-muted-foreground">Uploaded {formatDateTime(doc.uploadedAt)}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
