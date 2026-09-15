import { ArrowDown, ArrowUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: string
  value: string
  trend?: { direction: 'up' | 'down'; label: string }
}

export function KpiCard({ label, value, trend }: KpiCardProps) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {trend && (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              trend.direction === 'up' ? 'text-success' : 'text-destructive',
            )}
          >
            {trend.direction === 'up' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
