import type { ApplicationStatus, DocumentStatus } from '@/types'
import { STATUS_META } from '@/utils/workflow'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type BadgeColor = 'blue' | 'green' | 'amber' | 'red' | 'gray'

const COLOR_CLASSES: Record<BadgeColor, string> = {
  blue: 'bg-primary/10 text-primary',
  green: 'bg-success/10 text-success',
  amber: 'bg-warning/10 text-warning',
  red: 'bg-destructive/10 text-destructive',
  gray: 'bg-muted text-muted-foreground',
}

const DOCUMENT_STATUS_COLOR: Record<DocumentStatus, BadgeColor> = {
  Missing: 'gray',
  Uploaded: 'blue',
  'Under Verification': 'amber',
  Verified: 'green',
  Rejected: 'red',
}

export function StatusBadge({ status }: { status: ApplicationStatus | DocumentStatus }) {
  const meta = (STATUS_META as Record<string, { label: string; color: BadgeColor }>)[status]
  const color = meta?.color ?? DOCUMENT_STATUS_COLOR[status as DocumentStatus] ?? 'gray'
  const label = meta?.label ?? status

  return <Badge className={cn('border-0 font-medium', COLOR_CLASSES[color])}>{label}</Badge>
}
