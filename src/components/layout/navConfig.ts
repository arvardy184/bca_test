import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  ClipboardCheck,
  FilePlus2,
  FileStack,
  FileText,
  LayoutDashboard,
  Users,
  Wallet,
} from 'lucide-react'
import type { Role } from '@/types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  sales_dealer: [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'New Application', to: '/applications/new', icon: FilePlus2 },
    { label: 'My Applications', to: '/applications', icon: FileText },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Documents', to: '/documents', icon: FileStack },
  ],
  marketing: [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Applications', to: '/applications', icon: FileText },
    { label: 'Review Queue', to: '/applications', icon: ClipboardCheck },
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Documents', to: '/documents', icon: FileStack },
  ],
  marketing_supervisor: [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Approval Queue', to: '/approvals', icon: ClipboardCheck },
    { label: 'Applications', to: '/applications', icon: FileText },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
  ],
  back_office: [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Approved Applications', to: '/applications', icon: FileText },
    { label: 'Documents', to: '/documents', icon: FileStack },
    { label: 'Disbursement', to: '/disbursement', icon: Wallet },
    { label: 'Reports', to: '/reports', icon: BarChart3 },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  sales_dealer: 'Sales Dealer',
  marketing: 'Marketing',
  marketing_supervisor: 'Marketing Supervisor',
  back_office: 'Back Office',
}
