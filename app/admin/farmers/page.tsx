'use client'

import * as React from 'react'

import { adminApi } from '@/lib/admin/api'
import { PageHeader } from '@/components/admin/primitives'
import { FarmersTable } from '@/components/admin/farmers-table'

export default function FarmersPage() {
  const [description, setDescription] = React.useState('Approval queue and full farmer directory.')

  React.useEffect(() => {
    adminApi.getFarmers()
      .then((farmers) => {
        const pending = farmers.filter((f) => f.status === 'Pending').length
        const approved = farmers.filter((f) => f.status === 'Approved').length
        const suspended = farmers.filter((f) => f.status === 'Suspended').length
        setDescription(
          `Approval queue and full directory — ${pending} pending, ${approved} approved, ${suspended} suspended.`,
        )
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Farmers" description={description} />
      <FarmersTable />
    </div>
  )
}

