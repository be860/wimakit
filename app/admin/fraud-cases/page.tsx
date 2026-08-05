import type { Metadata } from 'next'

import { AlertTriangle, ShieldCheck, Timer } from 'lucide-react'

import { fraudCases } from '@/lib/admin/mock-data'
import { PageHeader, StatCard } from '@/components/admin/primitives'
import { FraudTable } from '@/components/admin/fraud-table'

export const metadata: Metadata = {
  title: 'Fraud Cases',
}

export default function FraudCasesPage() {
  const open = fraudCases.filter((c) => c.status === 'Open').length
  const review = fraudCases.filter((c) => c.status === 'Under Review').length
  const resolved = fraudCases.filter((c) => c.status === 'Resolved').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fraud Cases"
        description="Investigate reported disputes between buyers and farmers."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Open Cases"
          value={String(open)}
          delta={12.5}
          deltaLabel="vs last week"
          icon={AlertTriangle}
          emphasis
          invertGood
        />
        <StatCard
          label="Under Review"
          value={String(review)}
          delta={-4.2}
          deltaLabel="vs last week"
          icon={Timer}
          invertGood
        />
        <StatCard
          label="Resolved (30d)"
          value={String(resolved + 41)}
          delta={8.1}
          deltaLabel="vs last month"
          icon={ShieldCheck}
        />
      </div>
      <FraudTable />
    </div>
  )
}
