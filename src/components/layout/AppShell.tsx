import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell({
  title,
  breadcrumb,
  children,
}: {
  title: string
  breadcrumb: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        <Sidebar />
      </aside>
      <div className="lg:pl-64">
        <Header title={title} breadcrumb={breadcrumb} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
