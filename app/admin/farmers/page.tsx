import { farmers } from '@/lib/admin/mock-data'
import { PageHeader } from '@/components/admin/primitives'
import { FarmersTable } from '@/components/admin/farmers-table'

export const metadata = {
  title: 'Farmers',
}

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const counts = {
    pending: farmers.filter((f) => f.status === 'Pending').length,
    approved: farmers.filter((f) => f.status === 'Approved').length,
    suspended: farmers.filter((f) => f.status === 'Suspended').length,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Farmers"
        description={`Approval queue and full directory — ${counts.pending} pending, ${counts.approved} approved, ${counts.suspended} suspended in this sample.`}
      />
      <FarmersTable initialStatus={status} />
    </div>
  )
}
