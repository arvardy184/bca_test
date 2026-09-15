import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
      <ShieldAlert className="size-12 text-warning" />
      <h1 className="text-xl font-semibold text-foreground">Access Restricted</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        You don&apos;t have permission to access this resource.
      </p>
      <Button asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
