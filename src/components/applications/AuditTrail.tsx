import type { AuditLog } from '@/types'
import { formatDateTime } from '@/utils/format'

export function AuditTrail({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
  }
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <ul className="space-y-3">
      {sorted.map((log) => (
        <li key={log.id} className="border-l-2 border-border pl-3">
          <p className="text-xs text-muted-foreground">{formatDateTime(log.timestamp)}</p>
          <p className="text-sm font-medium text-foreground">{log.action}</p>
          <p className="text-xs text-muted-foreground">by {log.actor}</p>
        </li>
      ))}
    </ul>
  )
}
