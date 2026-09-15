import { FileX2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Customer, Dealer, LoanApplication, Vehicle } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export interface ApplicationsTableProps {
  applications: LoanApplication[]
  getCustomerById: (id: string) => Customer | undefined
  getVehicleById: (id: string) => Vehicle | undefined
  getDealerById: (id: string) => Dealer | undefined
}

export function ApplicationsTable({
  applications,
  getCustomerById,
  getVehicleById,
  getDealerById,
}: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={FileX2}
        title="No applications found"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dealer</TableHead>
              <TableHead>Loan Amount</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current PIC</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const customer = getCustomerById(app.customerId)
              const vehicle = getVehicleById(app.vehicleId)
              const dealer = getDealerById(app.dealerId)
              return (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.code}</TableCell>
                  <TableCell>{customer?.name}</TableCell>
                  <TableCell>{vehicle ? `${vehicle.brand} ${vehicle.model}` : '-'}</TableCell>
                  <TableCell>{dealer?.name}</TableCell>
                  <TableCell>{formatCurrency(app.financing.vehiclePrice)}</TableCell>
                  <TableCell>{formatDate(app.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell>{app.currentPIC}</TableCell>
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
      </div>

      <div className="space-y-3 md:hidden">
        {applications.map((app) => {
          const customer = getCustomerById(app.customerId)
          const vehicle = getVehicleById(app.vehicleId)
          return (
            <Link
              to={`/applications/${app.id}`}
              key={app.id}
              className="block rounded-xl border border-border p-4 hover:bg-muted/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{app.code}</span>
                <StatusBadge status={app.status} />
              </div>
              <p className="mt-1 text-sm text-foreground">{customer?.name}</p>
              <p className="text-xs text-muted-foreground">{vehicle ? `${vehicle.brand} ${vehicle.model}` : '-'}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(app.financing.vehiclePrice)}</span>
                <span>{formatDate(app.createdAt)}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
