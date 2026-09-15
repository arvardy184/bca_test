import { Download, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { ApplicationStatus, Dealer } from '@/types'
import { STATUS_FLOW, STATUS_META } from '@/utils/workflow'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ALL_STATUSES: ApplicationStatus[] = [...STATUS_FLOW, 'Need Revision', 'Rejected']

export interface ApplicationFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: ApplicationStatus | 'all'
  onStatusChange: (value: ApplicationStatus | 'all') => void
  dealerId: string | 'all'
  onDealerChange: (value: string) => void
  dealers: Dealer[]
}

export function ApplicationFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  dealerId,
  onDealerChange,
  dealers,
}: ApplicationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search application or customer..."
          className="pl-8"
        />
      </div>

      <Select value={status} onValueChange={(v) => onStatusChange(v as ApplicationStatus | 'all')}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dealerId} onValueChange={onDealerChange}>
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Dealer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Dealers</SelectItem>
          {dealers.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        className="w-full sm:ml-auto sm:w-auto"
        onClick={() => toast.info('Export started — a CSV would be generated in production.')}
      >
        <Download className="size-4" />
        Export
      </Button>
    </div>
  )
}
