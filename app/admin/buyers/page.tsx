'use client'

import * as React from 'react'

import { adminApi } from '@/lib/admin/api'
import { PageHeader } from '@/components/admin/primitives'
import { BuyersTable } from '@/components/admin/buyers-table'

export default function BuyersPage() {
  const [description, setDescription] = React.useState(
    'Registered wholesalers, processors, exporters, and institutional buyers.',
  )

  React.useEffect(() => {
    adminApi.getBuyers()
      .then((buyers) => {
        const pending = buyers.filter((b) => b.status === 'Pending').length
        const approved = buyers.filter((b) => b.status === 'Approved').length
        const suspended = buyers.filter((b) => b.status === 'Suspended').length
        setDescription(
          `Approval queue and full buyer directory — ${pending} pending, ${approved} approved, ${suspended} suspended.`,
        )
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Buyers"
        description={description}
      />
      <BuyersTable />
    </div>
  )
}

