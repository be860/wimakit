'use client'

import * as React from 'react'
import { Download } from 'lucide-react'

import { farmerApi, LE, type FarmerOrder } from '@/lib/farmer/api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, Panel } from '@/components/farmer/primitives'
import { FarmerRevenueChart, SalesByProductChart } from '@/components/farmer/farmer-charts'
import { BuyerDistrictChart } from '@/components/farmer/analytics-charts'

export default function FarmerAnalyticsPage() {
  const [sales, setSales] = React.useState<FarmerOrder[]>([])

  React.useEffect(() => {
    farmerApi
      .getFarmerSales()
      .then((data) => setSales(data || []))
      .catch(() => setSales([]))
  }, [])

  // Aggregate buyer districts
  const distMap = new Map<string, number>()
  for (const s of sales) {
    const dist = s.district || 'Western Area'
    distMap.set(dist, (distMap.get(dist) || 0) + 1)
  }
  const totalOrders = sales.length
  const totalDistricts = distMap.size

  // Aggregate product performance (this month vs last month)
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`

  const prodStats = new Map<string, { current: number; previous: number }>()
  for (const s of sales) {
    if (s.status === 'Cancelled') continue
    const pName = s.produceName || 'Produce'
    const d = new Date(s.createdAt)
    const mKey = `${d.getFullYear()}-${d.getMonth()}`
    const amt = s.totalAmount || s.amount || 0

    if (!prodStats.has(pName)) {
      prodStats.set(pName, { current: 0, previous: 0 })
    }
    const stat = prodStats.get(pName)!
    if (mKey === currentMonthKey) {
      stat.current += amt
    } else if (mKey === lastMonthKey) {
      stat.previous += amt
    }
  }

  const productPerformance = Array.from(prodStats.entries()).map(([product, stat]) => ({
    product,
    current: stat.current,
    previous: stat.previous,
  }))

  // Payout history (generated from completed sales)
  const deliveredSales = sales.filter((s) => s.status === 'Delivered')
  const totalDeliveredAmt = deliveredSales.reduce((acc, s) => acc + (s.totalAmount || s.amount || 0), 0)

  const payouts = totalOrders > 0
    ? [
        {
          ref: `PO-${now.getFullYear()}-001`,
          period: 'Current Period',
          orders: deliveredSales.length,
          amount: LE(totalDeliveredAmt),
          status: 'Paid',
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sales & Analytics"
        description="Revenue performance, best sellers and where your buyers are based."
      >
        <Button variant="outline">
          <Download data-icon="inline-start" />
          Download Report
        </Button>
      </PageHeader>

      <Panel
        title="Revenue Over Time"
        description="Gross sales in Leones"
        bodyClassName="p-4"
      >
        <FarmerRevenueChart />
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Top-Selling Products"
          description="Total sales per product"
          bodyClassName="p-4"
        >
          <SalesByProductChart />
        </Panel>
        <Panel
          title="Buyer Geography"
          description={`${totalOrders} orders across ${totalDistricts || 1} districts`}
          bodyClassName="p-4"
        >
          <BuyerDistrictChart />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Product Performance" description="Ranked by sales performance">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">This month</TableHead>
                <TableHead className="text-right">Last month</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productPerformance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                    No sales recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                productPerformance.map((p) => {
                  const prev = p.previous || 1
                  const change = ((p.current - p.previous) / prev) * 100
                  return (
                    <TableRow key={p.product}>
                      <TableCell className="font-medium">{p.product}</TableCell>
                      <TableCell className="tabular text-right">
                        {LE(p.current)}
                      </TableCell>
                      <TableCell className="tabular text-right text-muted-foreground">
                        {LE(p.previous)}
                      </TableCell>
                      <TableCell
                        className={
                          change >= 0
                            ? 'tabular text-right text-farmer'
                            : 'tabular text-right text-destructive'
                        }
                      >
                        {change >= 0 ? '+' : ''}
                        {change.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Payout History" description="Settled bi-weekly">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead className="hidden sm:table-cell">Period</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                    No payouts processed yet.
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((p) => (
                  <TableRow key={p.ref}>
                    <TableCell className="tabular font-medium">{p.ref}</TableCell>
                    <TableCell className="tabular hidden text-muted-foreground sm:table-cell">
                      {p.period}
                    </TableCell>
                    <TableCell className="tabular text-right text-muted-foreground">
                      {p.orders}
                    </TableCell>
                    <TableCell className="tabular text-right">{p.amount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Panel>
      </div>
    </div>
  )
}
