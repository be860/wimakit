import type { Metadata } from 'next'

import { PageHeader } from '@/components/farmer/primitives'
import { ProductsView } from '@/components/farmer/products-view'

export const metadata: Metadata = {
  title: 'My Products',
}

export default async function FarmerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Products"
        description="Farmer creates → Pending → SuperAdmin reviews → Approved → Visible to buyers."
      />
      <ProductsView openNew={params.new === '1'} />
    </div>
  )
}
