'use client'

import * as React from 'react'
import type { Metadata } from 'next'
import { AlertTriangle, Loader2, ShieldCheck, Timer } from 'lucide-react'

import { adminApi, FraudCase } from '@/lib/admin/api'
import { PageHeader, StatCard } from '@/components/admin/primitives'
import { FraudTable } from '@/components/admin/fraud-table'

export default function FraudCasesPage() {
  const [cases, setCases] = React.useState<FraudCase[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    adminApi.getFraudCases()
      .then(setCases)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const open = cases.filter((c) => c.status === 'Open').length
  const review = cases.filter((c) => c.status === 'Under Review').length
  const resolved = cases.filter((c) => c.status === 'Resolved').length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fraud Cases"
        description="Investigate reported disputes between buyers and farmers."
      />
      {loading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Open Cases"
            value={String(open)}
            icon={AlertTriangle}
            emphasis={open > 0}
            invertGood
          />
          <StatCard
            label="Under Review"
            value={String(review)}
            icon={Timer}
            invertGood
          />
          <StatCard
            label="Resolved (all time)"
            value={String(resolved)}
            icon={ShieldCheck}
          />
        </div>
      )}
      <FraudTable />
    </div>
  )
}
