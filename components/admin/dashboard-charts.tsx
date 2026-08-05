'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const axisTick = { fontSize: 11, fill: 'var(--muted-foreground)' }

/* -------------------------------------------------------------------------- */

const revenueConfig = {
  revenue: { label: 'Revenue (Le)', color: 'var(--primary)' },
} satisfies ChartConfig

interface RevenueChartProps {
  data?: { month: string; revenue: number; orders: number }[]
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  return (
    <ChartContainer config={revenueConfig} className="h-[240px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={axisTick}
          interval={0}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tick={axisTick}
          tickFormatter={(v) => `Le ${(v / 1_000_000).toFixed(0)}M`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `Le ${Number(value).toLocaleString()}`}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

/* -------------------------------------------------------------------------- */

const growthConfig = {
  farmers: { label: 'New farmers', color: 'var(--farmer)' },
  buyers: { label: 'New buyers', color: 'var(--buyer)' },
} satisfies ChartConfig

interface GrowthChartProps {
  data?: { month: string; farmers: number; buyers: number }[]
}

export function GrowthChart({ data = [] }: GrowthChartProps) {
  return (
    <ChartContainer config={growthConfig} className="h-[240px] w-full">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={axisTick}
        />
        <YAxis tickLine={false} axisLine={false} width={36} tick={axisTick} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="farmers"
          stroke="var(--color-farmers)"
          strokeWidth={2}
          dot={{ r: 2.5, strokeWidth: 0, fill: 'var(--color-farmers)' }}
        />
        <Line
          type="monotone"
          dataKey="buyers"
          stroke="var(--color-buyers)"
          strokeWidth={2}
          dot={{ r: 2.5, strokeWidth: 0, fill: 'var(--color-buyers)' }}
        />
      </LineChart>
    </ChartContainer>
  )
}

/* -------------------------------------------------------------------------- */

const cropsConfig = {
  volume: { label: 'Volume (qty)', color: 'var(--primary)' },
} satisfies ChartConfig

interface TopCropsChartProps {
  data?: { crop: string; volume: number }[]
}

export function TopCropsChart({ data = [] }: TopCropsChartProps) {
  return (
    <ChartContainer config={cropsConfig} className="h-[268px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis
          type="category"
          dataKey="crop"
          tickLine={false}
          axisLine={false}
          width={104}
          tick={axisTick}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `${Number(value).toLocaleString()} units`}
            />
          }
        />
        <Bar dataKey="volume" radius={[0, 3, 3, 0]} barSize={16}>
          {data.map((entry, i) => (
            <Cell
              key={entry.crop}
              fill={i === 0 ? 'var(--gold)' : 'var(--primary)'}
              fillOpacity={i === 0 ? 1 : 0.9 - i * 0.075}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/* -------------------------------------------------------------------------- */

const districtConfig = {
  farmers: { label: 'Farmers', color: 'var(--farmer)' },
  buyers: { label: 'Buyers', color: 'var(--buyer)' },
} satisfies ChartConfig

interface DistrictChartProps {
  data?: { district: string; farmers: number; buyers: number }[]
}

export function DistrictChart({ data = [] }: DistrictChartProps) {
  return (
    <ChartContainer config={districtConfig} className="h-[268px] w-full">
      <BarChart
        data={data}
        margin={{ left: 0, right: 8, top: 8, bottom: 4 }}
      >
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="district"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ ...axisTick, fontSize: 10 }}
          angle={-32}
          textAnchor="end"
          height={58}
        />
        <YAxis tickLine={false} axisLine={false} width={40} tick={axisTick} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="farmers" fill="var(--color-farmers)" radius={[3, 3, 0, 0]} barSize={12} />
        <Bar dataKey="buyers" fill="var(--color-buyers)" radius={[3, 3, 0, 0]} barSize={12} />
      </BarChart>
    </ChartContainer>
  )
}
