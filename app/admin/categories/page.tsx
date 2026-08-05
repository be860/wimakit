import type { Metadata } from 'next'

import { PageHeader } from '@/components/admin/primitives'
import { CategoriesTable } from '@/components/admin/categories-table'

export const metadata: Metadata = {
  title: 'Categories',
}

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="Manage product categories and their commission rates."
      />
      <CategoriesTable />
    </div>
  )
}
