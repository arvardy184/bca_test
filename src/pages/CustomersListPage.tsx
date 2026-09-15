import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { maskNIK } from '@/utils/mask'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function CustomersListPage() {
  const { customers, applications } = useData()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => c.name.toLowerCase().includes(q))
  }, [customers, search])

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb={['JKL CreditFlow', 'Customers']} title="Customers" />

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer name..." className="pl-8" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="Try a different search term." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Latest Application</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => {
                const customerApps = applications
                  .filter((a) => a.customerId === customer.id)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                const latest = customerApps[0]
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <Link to={`/customers/${customer.id}`} className="hover:underline">
                        {customer.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/customers/${customer.id}`} className="hover:underline">
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>{maskNIK(customer.nik)}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customerApps.length}</TableCell>
                    <TableCell>
                      {latest ? (
                        <Link to={`/applications/${latest.id}`} className="hover:underline">
                          {latest.code}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{latest ? <StatusBadge status={latest.status} /> : '-'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
