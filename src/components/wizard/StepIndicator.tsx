import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex items-center">
      {labels.map((label, idx) => {
        const step = idx + 1
        const isComplete = step < current
        const isCurrent = step === current
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isComplete && 'bg-success text-white',
                  isCurrent && 'bg-primary text-primary-foreground',
                  !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isComplete ? <Check className="size-4" /> : step}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {step < labels.length && (
              <div className={cn('mx-2 h-px flex-1', isComplete ? 'bg-success' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
