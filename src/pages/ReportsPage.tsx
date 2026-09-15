import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useData } from '@/context/DataContext'
import { STATUS_FLOW, STATUS_META } from '@/utils/workflow'
import { PageHeader } from '@/components/common/PageHeader'
import { DigitalizationImpact } from '@/components/common/DigitalizationImpact'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLOR_HEX: Record<string, string> = {
  blue: '#2563eb',
  green: '#16a34a',
  amber: '#d97706',
  red: '#dc2626',
  gray: '#94a3b8',
}

const ALL_STATUSES = [...STATUS_FLOW, 'Need Revision', 'Rejected'] as const

export default function ReportsPage() {
  const { applications, dealers } = useData()

  const byStatus = useMemo(
    () =>
      ALL_STATUSES.map((status) => ({
        status,
        label: STATUS_META[status].label,
        count: applications.filter((a) => a.status === status).length,
        color: COLOR_HEX[STATUS_META[status].color],
      })).filter((row) => row.count > 0),
    [applications],
  )

  const byMonth = useMemo(() => {
    const map = new Map<string, number>()
    applications.forEach((app) => {
      const key = app.createdAt.slice(0, 7)
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }))
  }, [applications])

  const byDealer = useMemo(
    () =>
      dealers.map((dealer) => ({
        name: dealer.name,
        count: applications.filter((a) => a.dealerId === dealer.id).length,
      })),
    [applications, dealers],
  )

  const decided = applications.filter((a) =>
    ['Approved', 'Rejected', 'Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed'].includes(a.status),
  )
  const approvedCount = decided.filter((a) => a.status !== 'Rejected').length
  const rejectedCount = decided.filter((a) => a.status === 'Rejected').length
  const approvalRate = decided.length ? Math.round((approvedCount / decided.length) * 100) : 0

  const pastApproval = applications.filter((a) =>
    ['Approved', 'Rejected', 'Document Pending', 'Signed', 'Ready for Disbursement', 'Disbursed'].includes(a.status),
  )
  const avgHours =
    pastApproval.length > 0
      ? pastApproval.reduce((sum, a) => sum + (new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime()), 0) /
        pastApproval.length /
        36e5
      : 0
  const avgH = Math.floor(avgHours)
  const avgM = Math.round((avgHours - avgH) * 60)

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb={['JKL CreditFlow', 'Reports']} title="Reports" subtitle="Operational visibility across the financing workflow." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Applications by Status</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {byStatus.map((row) => (
                    <Cell key={row.status} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications by Month</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4" style={{ height: 280 }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Approved', value: approvedCount },
                    { name: 'Rejected', value: rejectedCount },
                  ]}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div>
              <p className="text-3xl font-semibold text-foreground">{approvalRate}%</p>
              <p className="text-sm text-muted-foreground">of decided applications approved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Processing Time</CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col items-start justify-center gap-1" style={{ height: 280 }}>
            <p className="text-4xl font-semibold text-foreground">
              {avgH}h {avgM}m
            </p>
            <p className="text-sm text-muted-foreground">from submission to decision, averaged across decided applications</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Applications by Dealer</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDealer} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <DigitalizationImpact />
    </div>
  )
}
