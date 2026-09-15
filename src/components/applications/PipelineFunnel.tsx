import { ChevronRight } from 'lucide-react'
import type { LoanApplication } from '@/types'
import { STATUS_FLOW, STATUS_META } from '@/utils/workflow'

const COLOR_BG: Record<string, string> = {
  blue: 'bg-primary/10 text-primary',
  green: 'bg-success/10 text-success',
  amber: 'bg-warning/10 text-warning',
  red: 'bg-destructive/10 text-destructive',
  gray: 'bg-muted text-muted-foreground',
}

// Counts applications currently AT each exact pipeline stage (not cumulative).
export function PipelineFunnel({ applications }: { applications: LoanApplication[] }) {
  const counts = STATUS_FLOW.map((status) => applications.filter((a) => a.status === status).length)
  const max = Math.max(1, ...counts)

  return (
    <div className="flex flex-col gap-2 overflow-x-auto pb-2 sm:flex-row sm:items-stretch sm:gap-1">
      {STATUS_FLOW.map((status, idx) => {
        const meta = STATUS_META[status]
        const count = counts[idx]
        return (
          <div key={status} className="flex flex-1 items-center gap-1">
            <div className="flex min-w-[100px] flex-1 flex-col gap-1.5 rounded-lg border border-border p-3">
              <span className={`inline-flex w-fit rounded-md px-1.5 py-0.5 text-[11px] font-medium ${COLOR_BG[meta.color]}`}>
                {meta.label}
              </span>
              <span className="text-xl font-semibold text-foreground">{count}</span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${COLOR_BG[meta.color].split(' ')[0]}`}
                  style={{ width: `${Math.max(6, (count / max) * 100)}%` }}
                />
              </div>
            </div>
            {idx < STATUS_FLOW.length - 1 && (
              <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
            )}
          </div>
        )
      })}
    </div>
  )
}
