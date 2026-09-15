import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { UserX } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { formatCurrency, formatDate } from '@/utils/format'
import { maskNIK } from '@/utils/mask'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getCustomerById, applications, documents } = useData()
  const [nikRevealed, setNikRevealed] = useState(false)

  const customer = id ? getCustomerById(id) : undefined

  if (!customer) {
    return (
      <EmptyState
        icon={UserX}
        title="Customer not found"
        description="This customer doesn't exist or may have been removed."
        action={{ label: 'Back to Customers', onClick: () => window.history.back() }}
      />
    )
  }

  const customerApps = applications
    .filter((a) => a.customerId === customer.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const customerDocs = documents.filter((d) => customerApps.some((a) => a.id === d.applicationId))

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb={['JKL CreditFlow', 'Customers', customer.name]} title={customer.name} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="NIK" value={nikRevealed ? customer.nik : maskNIK(customer.nik)} />
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setNikRevealed((v) => !v)}>
              {nikRevealed ? 'Hide NIK' : 'Reveal NIK'}
            </Button>
            <Row label="Date of Birth" value={formatDate(customer.dob)} />
            <Row label="Marital Status" value={customer.maritalStatus} />
            <Row label="Phone" value={customer.phone} />
            <Row label="Email" value={customer.email} />
            <Row label="Address" value={customer.address} />
            <Row label="Occupation" value={customer.occupation} />
            <Row label="Monthly Income" value={formatCurrency(customer.monthlyIncome)} />
            {customer.spouse && <Row label="Spouse" value={customer.spouse.name} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financing History</CardTitle>
          </CardHeader>
          <CardContent>
            {customerApps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No financing history yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Financed Amount</TableHead>
                    <TableHead>Installment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.code}</TableCell>
                      <TableCell>{formatCurrency(app.financing.financedAmount)}</TableCell>
                      <TableCell>{formatCurrency(app.financing.estimatedInstallment)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link to={`/applications/${app.id}`} className="hover:underline">
                        {app.code}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(app.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {customerDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents on file.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {customerDocs.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                    <span>{doc.type}</span>
                    <StatusBadge status={doc.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
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
