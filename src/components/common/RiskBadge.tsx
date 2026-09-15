import type { RiskLevel } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const COLOR_CLASSES: Record<RiskLevel, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-destructive/10 text-destructive',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className="inline-flex items-center gap-1.5" title="Demo Risk Indicator — not a real credit score">
      <Badge className={cn('border-0 font-medium', COLOR_CLASSES[level])}>{level}</Badge>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Demo</span>
    </span>
  )
}
