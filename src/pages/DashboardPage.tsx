import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { KpiCard } from '@/components/common/KpiCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DigitalizationImpact } from '@/components/common/DigitalizationImpact'
import { PipelineFunnel } from '@/components/applications/PipelineFunnel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/utils/format'

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const { applications, documents, getCustomerById, getVehicleById } = useData()

  const total = applications.length
  const pendingReview = applications.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length
  const waitingApproval = applications.filter((a) => a.status === 'Waiting Approval').length
  const approved = applications.filter((a) =>
    ['Approved', 'Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed'].includes(a.status),
  ).length
  const disbursed = applications.filter((a) => a.status === 'Disbursed').length
  const rejected = applications.filter((a) => a.status === 'Rejected').length

  const recent = [...applications]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const allDocsCount = documents.length
  const completeDocsCount = documents.filter((d) => d.status !== 'Missing').length
  const documentCompletionRate = allDocsCount ? Math.round((completeDocsCount / allDocsCount) * 100) : 0

  const approvalRateBase = applications.filter(
    (a) => ['Approved', 'Rejected', 'Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed'].includes(a.status),
  ).length
  const approvalRate = approvalRateBase ? Math.round((approved / approvalRateBase) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Good morning, {currentUser?.name.split(' ')[0]}.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s your application overview today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total Applications" value={String(total)} trend={{ direction: 'up', label: '+12.4% vs last month' }} />
        <KpiCard label="Pending Review" value={String(pendingReview)} trend={{ direction: 'up', label: '+4.1% vs last month' }} />
        <KpiCard label="Waiting Approval" value={String(waitingApproval)} trend={{ direction: 'down', label: '-2.3% vs last month' }} />
        <KpiCard label="Approved" value={String(approved)} trend={{ direction: 'up', label: '+8.7% vs last month' }} />
        <KpiCard label="Disbursed" value={String(disbursed)} trend={{ direction: 'up', label: '+6.0% vs last month' }} />
        <KpiCard label="Rejected" value={String(rejected)} trend={{ direction: 'down', label: '-1.2% vs last month' }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineFunnel applications={applications} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/applications">View All Applications</Link>
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((app) => {
                const customer = getCustomerById(app.customerId)
                const vehicle = getVehicleById(app.vehicleId)
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.code}</TableCell>
                    <TableCell>{customer?.name}</TableCell>
                    <TableCell>{vehicle ? `${vehicle.brand} ${vehicle.model}` : '-'}</TableCell>
                    <TableCell>{formatCurrency(app.financing.vehiclePrice)}</TableCell>
                    <TableCell>{formatDate(app.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/applications/${app.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processing Performance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Average Processing Time</p>
            <p className="text-xl font-semibold text-foreground">4h 32m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Document Completion Rate</p>
            <p className="text-xl font-semibold text-foreground">{documentCompletionRate}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Approval Rate</p>
            <p className="text-xl font-semibold text-foreground">{approvalRate}%</p>
          </div>
        </CardContent>
      </Card>

      <DigitalizationImpact />
    </div>
  )
}
