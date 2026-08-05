'use client'

import * as React from 'react'
import {
  Banknote,
  CalendarRange,
  Clock,
  Download,
  Loader2,
  ShieldAlert,
  ShoppingCart,
  Sprout,
  Store,
  PackageSearch,
  Tag,
} from 'lucide-react'

import { adminApi, AdminMetrics, LE } from '@/lib/admin/api'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, Panel, StatCard } from '@/components/admin/primitives'
import {
  DistrictChart,
  GrowthChart,
  RevenueChart,
  TopCropsChart,
} from '@/components/admin/dashboard-charts'
import {
  AuditTimelinePanel,
  FraudCasesPanel,
  LatestOrdersPanel,
  PendingFarmersPanel,
  PendingProductsPanel,
} from '@/components/admin/dashboard-tables'

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = React.useState<AdminMetrics | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    adminApi.getMetrics()
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = metrics
    ? [
        {
          key: 'farmers',
          label: 'Total Farmers',
          value: metrics.totalFarmers.toLocaleString(),
          delta: metrics.pendingFarmerApprovals,
          deltaLabel: 'pending approval',
          icon: Sprout,
          emphasis: false,
          href: '/admin/farmers',
          invertGood: false,
        },
        {
          key: 'buyers',
          label: 'Total Buyers',
          value: metrics.totalBuyers.toLocaleString(),
          delta: null,
          deltaLabel: 'registered buyers',
          icon: Store,
          emphasis: false,
          href: '/admin/buyers',
          invertGood: false,
        },
        {
          key: 'pendingFarmers',
          label: 'Pending Approvals',
          value: metrics.pendingFarmerApprovals.toLocaleString(),
          delta: metrics.pendingProductApprovals,
          deltaLabel: 'products pending',
          icon: Clock,
          emphasis: metrics.pendingFarmerApprovals > 0,
          href: '/admin/farmers?status=Pending',
          invertGood: true,
        },
        {
          key: 'fraud',
          label: 'Open Fraud Cases',
          value: metrics.openFraudCases.toLocaleString(),
          delta: null,
          deltaLabel: 'active cases',
          icon: ShieldAlert,
          emphasis: metrics.openFraudCases > 0,
          href: '/admin/fraud-cases',
          invertGood: true,
        },
        {
          key: 'revenue',
          label: 'Total Revenue',
          value: `Le ${(metrics.totalRevenue / 1_000_000).toFixed(1)}M`,
          delta: metrics.ordersThisMonth,
          deltaLabel: 'orders this month',
          icon: Banknote,
          emphasis: false,
          href: null,
          invertGood: false,
        },
        {
          key: 'listings',
          label: 'Active Listings',
          value: metrics.activeProductListings.toLocaleString(),
          delta: metrics.pendingProductApprovals,
          deltaLabel: 'pending review',
          icon: PackageSearch,
          emphasis: false,
          href: '/admin/products',
          invertGood: false,
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Platform Oversight"
        description="Marketplace health across all districts."
      >
        <Button variant="outline" disabled>
          <Download data-icon="inline-start" />
          Export
        </Button>
      </PageHeader>

      {/* Metrics */}
      <section aria-label="Key metrics">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((m) => (
              <StatCard
                key={m.key}
                label={m.label}
                value={m.value}
                delta={m.delta}
                deltaLabel={m.deltaLabel}
                icon={m.icon}
                emphasis={m.emphasis}
                href={m.href}
                invertGood={m.invertGood}
              />
            ))}
          </div>
        )}
      </section>

      {/* Charts */}
      {!loading && metrics && (
        <section aria-label="Analytics" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <Panel
              title="Revenue Overview"
              description="Gross marketplace value, last 6 months"
              className="xl:col-span-3"
              bodyClassName="p-4"
            >
              <RevenueChart data={metrics.revenueByMonth} />
            </Panel>
            <Panel
              title="Farmer vs Buyer Growth"
              description="New verified accounts, last 6 months"
              className="xl:col-span-2"
              bodyClassName="p-4"
            >
              <GrowthChart data={metrics.growthByMonth} />
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Panel
              title="Top Crops by Volume"
              description="Quantity transacted, last 30 days"
              bodyClassName="p-4"
            >
              <TopCropsChart data={metrics.topCrops} />
            </Panel>
            <Panel
              title="District Distribution"
              description="Registered farmers and buyers per district"
              bodyClassName="p-4"
            >
              <DistrictChart data={metrics.districtBreakdown} />
            </Panel>
          </div>
        </section>
      )}

      {/* Queues */}
      <section aria-label="Approval queues" className="grid grid-cols-1 gap-4">
        <PendingFarmersPanel />
        <PendingProductsPanel />
      </section>

      {/* Activity */}
      <section aria-label="Operational activity" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <FraudCasesPanel />
          <LatestOrdersPanel />
        </div>
        <AuditTimelinePanel />
      </section>
    </div>
  )
}
