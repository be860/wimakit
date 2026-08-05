'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Banknote,
  CheckCircle2,
  Clock,
  Package,
  PackagePlus,
  ShieldCheck,
  Star,
} from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { farmerApi, LE, type FarmerOrder, type FarmerProduce, type FarmerReview } from '@/lib/farmer/api'
import { Button } from '@/components/ui/button'
import {
  PageHeader,
  Panel,
  StatCard,
  TrustScore,
  VerificationBadge,
} from '@/components/farmer/primitives'
import {
  FarmerRevenueChart,
  OrderStatusChart,
  SalesByProductChart,
} from '@/components/farmer/farmer-charts'
import {
  InventorySnapshotPanel,
  NotificationsPreviewPanel,
  QuickActionsPanel,
  RecentBuyersPanel,
  RecentOrdersPanel,
  RecentReviewsPanel,
} from '@/components/farmer/dashboard-panels'

const iconByKey = {
  revenue: Banknote,
  active: Package,
  pending: Clock,
  completed: CheckCircle2,
  rating: Star,
  trust: ShieldCheck,
} as const

export default function FarmerDashboardPage() {
  const { user } = useAuth()
  const [sales, setSales] = React.useState<FarmerOrder[]>([])
  const [produces, setProduces] = React.useState<FarmerProduce[]>([])
  const [reviews, setReviews] = React.useState<FarmerReview[]>([])

  React.useEffect(() => {
    farmerApi.getFarmerSales().then(setSales).catch(() => setSales([]))
    if (user?.id) {
      farmerApi.getFarmerProduce(user.id).then(setProduces).catch(() => setProduces([]))
      farmerApi.getFarmerReviews(user.id).then(setReviews).catch(() => setReviews([]))
    }
  }, [user?.id])

  const totalRevenue = sales
    .filter((s) => s.status !== 'Cancelled')
    .reduce((sum, s) => sum + (s.totalAmount || s.amount || 0), 0)

  const activeListings = produces.filter(
    (p) => p.status === 'available' || p.status === 'Live' || p.status === 'Approved',
  ).length

  const pendingOrders = sales.filter((s) => s.status === 'Pending').length
  const completedOrders = sales.filter((s) => s.status === 'Delivered').length

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0'

  const metrics = [
    {
      key: 'revenue',
      label: 'Gross Sales',
      value: LE(totalRevenue),
      delta: 0,
      deltaLabel: 'this season',
    },
    {
      key: 'active',
      label: 'Active Listings',
      value: activeListings.toString(),
      delta: 0,
      deltaLabel: 'listings',
    },
    {
      key: 'pending',
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      delta: 0,
      deltaLabel: 'action required',
    },
    {
      key: 'completed',
      label: 'Completed Orders',
      value: completedOrders.toString(),
      delta: 0,
      deltaLabel: 'delivered',
    },
    {
      key: 'rating',
      label: 'Average Rating',
      value: `${avgRating} ★`,
      delta: 0,
      deltaLabel: `from ${reviews.length} reviews`,
    },
    {
      key: 'trust',
      label: 'Trust Score',
      value: `${user?.status === 'Active' ? 88 : 75}/100`,
      delta: 0,
      deltaLabel: 'verified farmer',
    },
  ]

  const farmerName = user?.fullName || 'Farmer'
  const farmLocation = user?.district ? `${user.district} District` : 'Sierra Leone'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={farmerName}
        description={`${user?.farmName || 'WiMakit Farm'} · ${farmLocation}`}
      >
        <VerificationBadge status={user?.verificationStatus || 'Approved'} />
        <Button
          nativeButton={false}
          render={<Link href="/farmer/products?new=1" />}
          className="bg-farmer text-background hover:bg-farmer/90"
        >
          <PackagePlus data-icon="inline-start" />
          Add Product
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TrustScore score={(user as any)?.trustScore || 85} hint="Trust score reflects order fulfillment speed, quality reviews, and NIN verification." />
        <div className="flex flex-col justify-center gap-1 rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">
            Verification Status
          </span>
          <span className="text-sm">
            {user?.verificationStatus || 'Approved'}
          </span>
        </div>
        <div className="flex flex-col justify-center gap-1 rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">
            Primary crops
          </span>
          <span className="text-sm">{(user as Record<string, any>)?.primaryCrops || 'Local Produce'}</span>
        </div>
      </div>

      {/* Key metrics */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map((m) => (
            <StatCard
              key={m.key}
              label={m.label}
              value={m.value}
              delta={m.delta}
              deltaLabel={m.deltaLabel}
              icon={iconByKey[m.key as keyof typeof iconByKey]}
              emphasis={m.key === 'revenue'}
            />
          ))}
        </div>
      </section>

      {/* Charts */}
      <section aria-label="Sales analytics" className="flex flex-col gap-4">
        <Panel
          title="Monthly Revenue"
          description="Gross sales in Leones"
          bodyClassName="p-4"
        >
          <FarmerRevenueChart />
        </Panel>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <Panel
            title="Sales Trends by Product"
            description="Top crops breakdown"
            className="xl:col-span-3"
            bodyClassName="p-4"
          >
            <SalesByProductChart />
          </Panel>
          <Panel
            title="Order Status Breakdown"
            description="All orders this season"
            className="xl:col-span-2"
            bodyClassName="p-4"
          >
            <OrderStatusChart />
          </Panel>
        </div>
      </section>

      {/* Operations */}
      <section aria-label="Orders and inventory" className="flex flex-col gap-4">
        <RecentOrdersPanel />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <InventorySnapshotPanel />
            <RecentBuyersPanel />
          </div>
          <div className="flex flex-col gap-4">
            <QuickActionsPanel />
            <NotificationsPreviewPanel />
            <RecentReviewsPanel />
          </div>
        </div>
      </section>
    </div>
  )
}

