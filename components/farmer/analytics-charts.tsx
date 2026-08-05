'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { useAuth } from '@/components/providers/auth-provider'
import { farmerApi, type FarmerOrder, type FarmerReview } from '@/lib/farmer/api'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const axisTick = { fontSize: 11, fill: 'var(--muted-foreground)' }

/* ------------------------ buyer geography (bars) -------------------------- */

const districtConfig = {
  orders: { label: 'Orders', color: 'var(--farmer)' },
} satisfies ChartConfig

export function BuyerDistrictChart() {
  const [sales, setSales] = React.useState<FarmerOrder[]>([])

  React.useEffect(() => {
    farmerApi.getFarmerSales().then((data) => setSales(data || [])).catch(() => setSales([]))
  }, [])

  const distMap = new Map<string, number>()
  for (const s of sales) {
    const dist = s.district || 'Western Area'
    distMap.set(dist, (distMap.get(dist) || 0) + 1)
  }

  const buyerDistricts = Array.from(distMap.entries()).map(([district, orders]) => ({
    district,
    orders,
  }))

  const data = buyerDistricts.length
    ? buyerDistricts
    : [{ district: 'Sierra Leone', orders: 0 }]

  return (
    <ChartContainer config={districtConfig} className="h-[240px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis
          type="category"
          dataKey="district"
          tickLine={false}
          axisLine={false}
          width={92}
          tick={axisTick}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="orders" fill="var(--color-orders)" radius={[0, 3, 3, 0]} barSize={16} />
      </BarChart>
    </ChartContainer>
  )
}

/* --------------------- rating distribution (bars) ------------------------- */

const ratingConfig = {
  count: { label: 'Reviews', color: 'var(--gold)' },
} satisfies ChartConfig

export function RatingDistributionChart() {
  const { user } = useAuth()
  const [reviews, setReviews] = React.useState<FarmerReview[]>([])

  React.useEffect(() => {
    if (user?.id) {
      farmerApi.getFarmerReviews(user.id).then((data) => setReviews(data || [])).catch(() => setReviews([]))
    }
  }, [user?.id])

  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews) {
    const s = Math.min(5, Math.max(1, Math.round(r.rating)))
    starCounts[s] = (starCounts[s] || 0) + 1
  }

  const data = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    label: `${stars} star`,
    count: starCounts[stars],
  }))

  return (
    <ChartContainer config={ratingConfig} className="h-[180px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={54}
          tick={axisTick}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 3, 3, 0]} barSize={14} />
      </BarChart>
    </ChartContainer>
  )
}

