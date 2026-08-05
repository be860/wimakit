import { PageHeader } from '@/components/admin/primitives'
import { BuyersTable } from '@/components/admin/buyers-table'

export const metadata = {
  title: 'Buyers',
}

export default function BuyersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Buyers"
        description="Registered wholesalers, processors, exporters, and institutional buyers."
      />
      <BuyersTable />
    </div>
  )
}
