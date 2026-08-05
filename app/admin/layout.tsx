import type { Metadata } from 'next'

import { AdminShell } from '@/components/admin/admin-shell'

export const metadata: Metadata = {
  title: {
    default: 'SuperAdmin — Platform Oversight',
    template: '%s · WiMakit SuperAdmin',
  },
  description:
    'Internal oversight dashboard for WiMakit platform staff: farmer and product approvals, fraud cases, and marketplace analytics across Sierra Leone.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
