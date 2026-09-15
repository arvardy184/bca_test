import { useMemo, useState } from 'react'
import type { ApplicationStatus } from '@/types'
import { useData } from '@/context/DataContext'
import { PageHeader } from '@/components/common/PageHeader'
import { ApplicationFilters } from '@/components/applications/ApplicationFilters'
import { ApplicationsTable } from '@/components/applications/ApplicationsTable'

export default function ApplicationsListPage() {
  const { applications, dealers, getCustomerById, getVehicleById, getDealerById } = useData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all')
  const [dealerId, setDealerId] = useState<string>('all')

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (status !== 'all' && app.status !== status) return false
      if (dealerId !== 'all' && app.dealerId !== dealerId) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const customer = getCustomerById(app.customerId)
        const matches = app.code.toLowerCase().includes(q) || customer?.name.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [applications, status, dealerId, search, getCustomerById])

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={['JKL CreditFlow', 'Applications']}
        title="Credit Applications"
        subtitle="Monitor and manage vehicle financing applications."
      />
      <ApplicationFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        dealerId={dealerId}
        onDealerChange={setDealerId}
        dealers={dealers}
      />
      <ApplicationsTable
        applications={filtered}
        getCustomerById={getCustomerById}
        getVehicleById={getVehicleById}
        getDealerById={getDealerById}
      />
    </div>
  )
}
