import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROLE_LABEL } from '@/components/layout/navConfig'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { Role } from '@/types'

const ALL_ROLES: Role[] = ['sales_dealer', 'marketing', 'marketing_supervisor', 'back_office']

export default function SettingsPage() {
  const { currentUser, loginAsRole } = useAuth()

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb={['JKL CreditFlow', 'Settings']} title="Settings" />

      <Card>
        <CardHeader>
          <CardTitle>Current Demo User</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            {currentUser?.initials}
          </div>
          <div>
            <p className="font-medium text-foreground">{currentUser?.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser && ROLE_LABEL[currentUser.role]}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Switch Demo Role</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {ALL_ROLES.map((role) => (
            <Button
              key={role}
              variant={currentUser?.role === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => loginAsRole(role)}
            >
              {ROLE_LABEL[role]}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Alert>
        <ShieldAlert className="size-4" />
        <AlertTitle>Security &amp; Architecture Note</AlertTitle>
        <AlertDescription>
          Production implementation should enforce authorization, encryption, secure document storage, audit
          logging, and server-side validation. Role checks in this prototype are enforced only in the frontend and
          are not a substitute for backend authorization.
        </AlertDescription>
      </Alert>
    </div>
  )
}
