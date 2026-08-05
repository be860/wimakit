import type React from 'react'
import type { Metadata } from 'next'

import { FarmerShell } from '@/components/farmer/farmer-shell'

export const metadata: Metadata = {
  title: {
    default: 'Farmer Portal',
    template: '%s · WiMakit Farmer',
  },
  description:
    'Manage your listings, orders, buyer messages, reviews and sales performance on the WiMakit agricultural marketplace.',
}

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <FarmerShell>{children}</FarmerShell>
}
