import { Check, Circle } from 'lucide-react'
import type { ApplicationStatus, AuditLog } from '@/types'
import { STATUS_FLOW } from '@/utils/workflow'
import { formatDateTime } from '@/utils/format'
import { cn } from '@/lib/utils'

// Side-branch statuses (Need Revision, Rejected) render as a note rather than a pipeline stage.
export function WorkflowTimeline({ status, auditLogs }: { status: ApplicationStatus; auditLogs: AuditLog[] }) {
  const isSideBranch = status === 'Need Revision' || status === 'Rejected'
  const currentIndex = isSideBranch ? -1 : STATUS_FLOW.indexOf(status)

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-1">
        {STATUS_FLOW.map((stage, idx) => {
          const isComplete = !isSideBranch && idx < currentIndex
          const isCurrent = !isSideBranch && idx === currentIndex
          const log = auditLogs.find((l) => l.action.toLowerCase().includes(stage.toLowerCase()))
          return (
            <div key={stage} className="flex flex-1 items-start gap-2 sm:flex-col sm:items-center sm:text-center">
              <div
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  isComplete && 'bg-success text-white',
                  isCurrent && 'bg-primary text-primary-foreground',
                  !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : <Circle className="size-2 fill-current" />}
              </div>
              <div className="sm:mt-1">
                <p className={cn('text-xs font-medium', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                  {stage}
                </p>
                {(isComplete || isCurrent) && log && (
                  <p className="text-[10px] text-muted-foreground">{formatDateTime(log.timestamp)}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {isSideBranch && (
        <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
          Current status: {status} — outside the standard happy-path pipeline shown above.
        </p>
      )}
    </div>
  )
}
