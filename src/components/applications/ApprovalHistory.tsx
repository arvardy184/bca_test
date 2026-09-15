import type { Approval } from '@/types'
import { formatDateTime } from '@/utils/format'

export function ApprovalHistory({ approvals }: { approvals: Approval[] }) {
  if (approvals.length === 0) {
    return <p className="text-sm text-muted-foreground">No approval decisions have been recorded yet.</p>
  }
  const sorted = [...approvals].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <ul className="space-y-3">
      {sorted.map((approval) => (
        <li key={approval.id} className="border-l-2 border-border pl-3">
          <p className="text-xs text-muted-foreground">{formatDateTime(approval.timestamp)}</p>
          <p className="text-sm font-medium text-foreground">
            {approval.action} by {approval.approver}
          </p>
          {approval.notes && <p className="text-sm text-muted-foreground">{approval.notes}</p>}
        </li>
      ))}
    </ul>
  )
}
