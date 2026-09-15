import { LogOut, Settings } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { NAV_BY_ROLE, ROLE_LABEL } from './navConfig'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  if (!currentUser) return null
  const items = NAV_BY_ROLE[currentUser.role]

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          JKL
        </div>
        <div>
          <div className="text-sm font-semibold text-sidebar-foreground">JKL</div>
          <div className="text-xs text-muted-foreground">CreditFlow</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.label + item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border px-3 py-4">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            )
          }
        >
          <Settings className="size-4" />
          Settings
        </NavLink>

        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {currentUser.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-sidebar-foreground">{currentUser.name}</div>
            <div className="truncate text-xs text-muted-foreground">{ROLE_LABEL[currentUser.role]}</div>
          </div>
          <button
            type="button"
            title="Log out"
            onClick={() => {
              logout()
              onNavigate?.()
              navigate('/login')
            }}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent/60 hover:text-destructive"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
