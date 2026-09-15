import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

export interface PageHeaderProps {
  breadcrumb: string[]
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ breadcrumb, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumb.map((crumb, idx) => (
            <span key={crumb} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight className="size-3" />}
              {crumb}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
