import type { Metadata } from 'next'

import { PageHeader } from '@/components/farmer/primitives'
import { SettingsView } from '@/components/farmer/settings-view'

export const metadata: Metadata = {
  title: 'Settings',
}

export default function FarmerSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, farm details, password and notification preferences."
      />
      <SettingsView />
    </div>
  )
}
