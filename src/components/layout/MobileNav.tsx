import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="size-5" />
        <span className="sr-only">Open navigation</span>
      </Button>
      <SheetContent side="left" className="w-64 p-0 sm:max-w-64">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
