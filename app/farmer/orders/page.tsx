import type { Metadata } from 'next'

import { PageHeader } from '@/components/farmer/primitives'
import { OrdersView } from '@/components/farmer/orders-view'

export const metadata: Metadata = {
  title: 'Orders',
}

export default function FarmerOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description="Track buyer orders, update delivery status and review payment references."
      />
      <OrdersView />
    </div>
  )
}
