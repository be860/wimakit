import type { Metadata } from 'next'

import { PageHeader } from '@/components/farmer/primitives'
import { NotificationsFeed } from '@/components/farmer/notifications-feed'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function FarmerNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Order updates, listing approvals, messages and platform broadcasts."
      />
      <NotificationsFeed />
    </div>
  )
}
