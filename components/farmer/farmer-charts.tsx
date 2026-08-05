'use client'

import * as React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

import { farmerApi, type FarmerOrder } from '@/lib/farmer/api'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const axisTick = { fontSize: 11, fill: 'var(--muted-foreground)' }

/* --------------------------- revenue (area) ------------------------------- */

const revenueConfig = {
  revenue: { label: 'Revenue (Le)', color: 'var(--farmer)' },
} satisfies ChartConfig

export function FarmerRevenueChart() {
  const [sales, setSales] = React.useState<FarmerOrder[]>([])

  React.useEffect(() => {
    farmerApi.getFarmerSales().then((data) => setSales(data || [])).catch(() => setSales([]))
  }, [])

  // Aggregate revenue by month
  const monthlyMap = new Map<string, number>()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Initialize last 6 months
  const now = new Date()
  const chartData: { month: string; revenue: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mKey = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
    monthlyMap.set(mKey, 0)
  }

  for (const s of sales) {
    if (s.status !== 'Cancelled') {
      const d = new Date(s.createdAt)
      const mKey = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
      if (monthlyMap.has(mKey)) {
        monthlyMap.set(mKey, (monthlyMap.get(mKey) || 0) + (s.totalAmount || s.amount || 0))
      }
    }
  }

  monthlyMap.forEach((rev, month) => {
    chartData.push({ month, revenue: rev })
  })

  return (
    <ChartContainer config={revenueConfig} className="h-[240px] w-full">
      <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="farmerRevenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--farmer)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--farmer)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={50}
          tick={axisTick}
          tickFormatter={(v) => `Le ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => `Le ${Number(value).toLocaleString()}`} />}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--farmer)"
          strokeWidth={2}
          fill="url(#farmerRevenueFill)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

/* ----------------------- sales by product (bars) -------------------------- */

const salesConfig = {
  totalSales: { label: 'Total Sales (Le)', color: 'var(--farmer)' },
} satisfies ChartConfig

export function SalesByProductChart() {
  const [sales, setSales] = React.useState<FarmerOrder[]>([])

  React.useEffect(() => {
    farmerApi.getFarmerSales().then((data) => setSales(data || [])).catch(() => setSales([]))
  }, [])

  const prodMap = new Map<string, number>()
  for (const s of sales) {
    const pName = s.produceName || 'Produce'
    prodMap.set(pName, (prodMap.get(pName) || 0) + (s.totalAmount || s.amount || 0))
  }

  const chartData = Array.from(prodMap.entries()).map(([product, totalSales]) => ({
    product,
    totalSales,
  }))

  return (
    <ChartContainer config={salesConfig} className="h-[240px] w-full">
      <BarChart data={chartData.length ? chartData : [{ product: 'No Sales Yet', totalSales: 0 }]} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="product"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ ...axisTick, fontSize: 10 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={50}
          tick={axisTick}
          tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="totalSales" fill="var(--color-totalSales)" radius={[3, 3, 0, 0]} barSize={20} />
      </BarChart>
    </ChartContainer>
  )
}

/* --------------------- order status breakdown (donut) --------------------- */

const orderConfig = {
  Delivered: { label: 'Delivered', color: 'var(--farmer)' },
  InTransit: { label: 'In Transit', color: 'var(--buyer)' },
  Pending: { label: 'Pending', color: 'var(--gold)' },
  Cancelled: { label: 'Cancelled', color: 'var(--alert)' },
} satisfies ChartConfig

export function OrderStatusChart() {
  const [sales, setSales] = React.useState<FarmerOrder[]>([])

  React.useEffect(() => {
    farmerApi.getFarmerSales().then((data) => setSales(data || [])).catch(() => setSales([]))
  }, [])

  const counts: Record<string, number> = {
    Delivered: 0,
    InTransit: 0,
    Pending: 0,
    Cancelled: 0,
  }

  for (const s of sales) {
    const st = s.status || 'Pending'
    if (st.includes('Transit')) counts.InTransit += 1
    else if (st === 'Delivered') counts.Delivered += 1
    else if (st === 'Cancelled') counts.Cancelled += 1
    else counts.Pending += 1
  }

  const orderStatusBreakdown = [
    { status: 'Delivered', value: counts.Delivered, fill: 'var(--farmer)' },
    { status: 'InTransit', value: counts.InTransit, fill: 'var(--buyer)' },
    { status: 'Pending', value: counts.Pending, fill: 'var(--gold)' },
    { status: 'Cancelled', value: counts.Cancelled, fill: 'var(--alert)' },
  ].filter((d) => d.value > 0)

  const total = sales.length

  return (
    <ChartContainer
      config={orderConfig}
      className="mx-auto aspect-square h-[240px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
        <Pie
          data={orderStatusBreakdown.length ? orderStatusBreakdown : [{ status: 'None', value: 1, fill: 'var(--muted)' }]}
          dataKey="value"
          nameKey="status"
          innerRadius={58}
          outerRadius={88}
          strokeWidth={2}
          stroke="var(--card)"
        >
          {(orderStatusBreakdown.length ? orderStatusBreakdown : [{ status: 'None', value: 1, fill: 'var(--muted)' }]).map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground font-display text-2xl"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      Orders
                    </tspan>
                  </text>
                )
              }
              return null
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  )
}

