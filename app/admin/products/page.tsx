import type { Metadata } from 'next'

import { PageHeader } from '@/components/admin/primitives'
import {
  ProductApprovalQueue,
  ProductCatalog,
} from '@/components/admin/products-table'

export const metadata: Metadata = {
  title: 'Products',
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="Moderate new listings and manage the full marketplace catalog."
      />
      <ProductApprovalQueue />
      <ProductCatalog />
    </div>
  )
}
