import type { Role, User } from '@/types'

export const DEMO_USERS: Record<Role, User> = {
  sales_dealer: { id: 'user-sales', name: 'Andi Wirawan', role: 'sales_dealer', initials: 'AW' },
  marketing: { id: 'user-marketing', name: 'Budi Hartono', role: 'marketing', initials: 'BH' },
  marketing_supervisor: { id: 'user-supervisor', name: 'Citra Dewi', role: 'marketing_supervisor', initials: 'CD' },
  back_office: { id: 'user-backoffice', name: 'Doni Firmansyah', role: 'back_office', initials: 'DF' },
}
