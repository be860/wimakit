import type { Metadata } from 'next'

import { Download } from 'lucide-react'

import { buyerDistricts, salesByProduct } from '@/lib/farmer/mock-data'
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

const payouts = [
  { ref: 'PO-2025-0812', period: '01–15 Jul 2025', orders: 9, amount: 'Le 7.85m', status: 'Paid' },
  { ref: 'PO-2025-0798', period: '16–30 Jun 2025', orders: 11, amount: 'Le 9.10m', status: 'Paid' },
  { ref: 'PO-2025-0781', period: '01–15 Jun 2025', orders: 8, amount: 'Le 6.42m', status: 'Paid' },
  { ref: 'PO-2025-0764', period: '16–31 May 2025', orders: 10, amount: 'Le 8.05m', status: 'Paid' },
]

export const metadata: Metadata = {
  title: 'Sales & Analytics',
}

export default function FarmerAnalyticsPage() {
  const totalDistrictOrders = buyerDistricts.reduce((n, d) => n + d.orders, 0)

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
        description="Gross sales in millions of Leones, last 12 months"
        bodyClassName="p-4"
      >
        <FarmerRevenueChart />
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Top-Selling Products"
          description="This month vs last month, in millions of Leones"
          bodyClassName="p-4"
        >
          <SalesByProductChart />
        </Panel>
        <Panel
          title="Buyer Geography"
          description={`${totalDistrictOrders} orders across ${buyerDistricts.length} districts`}
          bodyClassName="p-4"
        >
          <BuyerDistrictChart />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Product Performance" description="Ranked by revenue this month">
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
              {salesByProduct.map((p) => {
                const change = ((p.current - p.previous) / p.previous) * 100
                return (
                  <TableRow key={p.product}>
                    <TableCell className="font-medium">{p.product}</TableCell>
                    <TableCell className="tabular text-right">
                      Le {p.current.toFixed(1)}m
                    </TableCell>
                    <TableCell className="tabular text-right text-muted-foreground">
                      Le {p.previous.toFixed(1)}m
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
              })}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Payout History" description="Settled every two weeks">
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
              {payouts.map((p) => (
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
              ))}
            </TableBody>
          </Table>
        </Panel>
      </div>
    </div>
  )
}
