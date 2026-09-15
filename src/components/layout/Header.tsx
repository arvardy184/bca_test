import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MobileNav } from './MobileNav'

const NOTIFICATIONS = [
  'APP-2026-00127 needs your review',
  'APP-2026-00116 is waiting for supervisor approval',
  'APP-2026-00119 is ready for disbursement',
]

export function Header({ title, breadcrumb }: { title: string; breadcrumb: string }) {
  const { currentUser } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
      <MobileNav />

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs text-muted-foreground">{breadcrumb}</div>
        <div className="truncate text-sm font-semibold text-foreground">{title}</div>
      </div>

      <div className="hidden max-w-xs flex-1 items-center sm:flex">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search applications, customers..." className="h-8 pl-8 text-sm" />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {NOTIFICATIONS.map((note) => (
            <DropdownMenuItem key={note} className="whitespace-normal text-xs">
              {note}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {currentUser && (
        <div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {currentUser.initials}
        </div>
      )}
    </header>
  )
}
