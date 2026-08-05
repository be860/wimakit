'use client'

import * as React from 'react'
import { MapPin, Search, Truck } from 'lucide-react'

import { farmerApi, LE, type FarmerOrder } from '@/lib/farmer/api'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Panel, StatusBadge } from '@/components/farmer/primitives'

const STATUS_FILTERS = [
  'All',
  'Pending',
  'In Transit',
  'Delivered',
  'Cancelled',
]

export function OrdersView() {
  const [sales, setSales] = React.useState<FarmerOrder[]>([])
  const [status, setStatus] = React.useState<string>('All')
  const [query, setQuery] = React.useState('')
  const [activeId, setActiveId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(false)

  const fetchSales = React.useCallback(() => {
    farmerApi
      .getFarmerSales()
      .then((data) => setSales(data || []))
      .catch(() => setSales([]))
  }, [])

  React.useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const visible = sales.filter((o) => {
    const matchStatus = status === 'All' || o.status === status
    const matchQuery =
      query.trim() === '' ||
      [o.orderNumber, o.buyerName, o.produceName, o.district]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    return matchStatus && matchQuery
  })

  const active = sales.find((o) => o.id === activeId) ?? null

  async function markStatus(id: number, newStatus: string) {
    setLoading(true)
    try {
      await farmerApi.updateOrderStatus(id, newStatus)
      setSales((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
      )
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Panel
        title="Order Book"
        description={`${visible.length} of ${sales.length} orders`}
        action={
          <InputGroup className="w-[200px]">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Order, buyer, product…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search orders"
            />
          </InputGroup>
        }
      >
        <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatus(f)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                status === f
                  ? 'border-farmer bg-farmer text-background'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead className="hidden lg:table-cell">Product</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Qty</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((o) => {
                const buyerInitials = o.buyerName
                  ? o.buyerName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'BY'
                return (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer"
                    onClick={() => setActiveId(o.id)}
                  >
                    <TableCell>
                      <span className="tabular block font-medium">{o.orderNumber || `#${o.id}`}</span>
                      <span className="tabular block text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-secondary text-[11px] text-muted-foreground">
                            {buyerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex flex-col">
                          <span className="text-sm">{o.buyerName}</span>
                          <span className="text-xs text-muted-foreground">
                            {o.district || o.buyerPhone || 'Western Area'}
                          </span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                      {o.produceName}
                    </TableCell>
                    <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                      {o.quantity}
                    </TableCell>
                    <TableCell className="tabular text-right">{LE(o.totalAmount || o.amount)}</TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={o.status as any} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Panel>

      <Dialog
        open={Boolean(active)}
        onOpenChange={(open) => !open && setActiveId(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display tabular">{active.orderNumber || `#${active.id}`}</DialogTitle>
                <DialogDescription>
                  Placed {new Date(active.createdAt).toLocaleDateString()} · {active.buyerName}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={active.status as any} />
                  <span className="tabular text-xs text-muted-foreground">
                    Payment via {active.paymentMethod || 'Mobile Money'}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                  {[
                    ['Product', active.produceName],
                    ['Quantity', active.quantity],
                    ['Amount', LE(active.totalAmount || active.amount)],
                    ['District', active.district || 'Western Area'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-0.5">
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex gap-2.5 rounded-lg border border-border p-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Delivery address
                    </p>
                    <p className="text-sm leading-relaxed">{active.deliveryAddress || 'Freetown Central Market'}</p>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Contact info is never shared outside the platform. Coordinate delivery
                  through WiMakit messages only.
                </p>
              </div>

              <DialogFooter>
                {(active.status === 'Pending' || active.status === 'Processing') && (
                  <Button
                    disabled={loading}
                    className="bg-farmer text-background hover:bg-farmer/90"
                    onClick={() => markStatus(active.id, 'In Transit')}
                  >
                    <Truck data-icon="inline-start" />
                    Mark as In Transit
                  </Button>
                )}
                {active.status === 'In Transit' && (
                  <Button
                    disabled={loading}
                    className="bg-farmer text-background hover:bg-farmer/90"
                    onClick={() => markStatus(active.id, 'Delivered')}
                  >
                    <Truck data-icon="inline-start" />
                    Mark as Delivered
                  </Button>
                )}
                <Button variant="outline" onClick={() => setActiveId(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

