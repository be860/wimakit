import type { Metadata } from 'next'

import { PageHeader } from '@/components/farmer/primitives'
import { MessagesView } from '@/components/farmer/messages-view'

export const metadata: Metadata = {
  title: 'Messages',
}

export default function FarmerMessagesPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Messages"
        description="Talk to buyers and WiMakit support without leaving the platform."
      />
      <MessagesView />
    </div>
  )
}
