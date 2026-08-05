import type { Metadata } from 'next'

import { PageHeader } from '@/components/farmer/primitives'
import { ReviewsView } from '@/components/farmer/reviews-view'

export const metadata: Metadata = {
  title: 'Reviews',
}

export default function FarmerReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reviews"
        description="Buyer ratings feed directly into your Trust Score."
      />
      <ReviewsView />
    </div>
  )
}
