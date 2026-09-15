import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ROLE_LABEL } from '@/components/layout/navConfig'
import type { Role } from '@/types'

const DEMO_ROLES: Role[] = ['sales_dealer', 'marketing', 'marketing_supervisor', 'back_office']

export default function LoginPage() {
  const { currentUser, loginAsRole } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (currentUser) return <Navigate to="/" replace />

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    loginAsRole('sales_dealer')
    navigate('/')
  }

  function handleDemoLogin(role: Role) {
    loginAsRole(role)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-6" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">JKL CreditFlow</h1>
          <p className="mt-1 text-sm text-muted-foreground">Digital Vehicle Financing Platform</p>
        </div>

        <Card>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="andi.wirawan"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                This is a prototype — signing in logs you in as the Sales Dealer demo user.
              </p>
            </form>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Demo Access</span>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map((role) => (
                <Button key={role} type="button" variant="outline" size="sm" onClick={() => handleDemoLogin(role)}>
                  {ROLE_LABEL[role]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
