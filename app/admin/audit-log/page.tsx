import type { Metadata } from 'next'

import { PageHeader } from '@/components/admin/primitives'
import { AuditTable } from '@/components/admin/audit-table'

export const metadata: Metadata = {
  title: 'Audit Log',
}

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit Log"
        description="A complete, filterable record of every privileged action taken by staff."
      />
      <AuditTable />
    </div>
  )
}
