'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  Megaphone,
  MessageSquare,
  Package,
  PackagePlus,
  ShoppingBag,
  Wallet,
} from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import {
  farmerApi,
  LE,
  type FarmerNotification,
  type FarmerOrder,
  type FarmerProduce,
  type FarmerReview,
} from '@/lib/farmer/api'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Panel, StarRating, StatusBadge } from '@/components/farmer/primitives'

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={href} />}>
      {label}
    </Button>
  )
}

/* ---------------------------- recent orders ------------------------------- */

export function RecentOrdersPanel() {
  const [orders, setOrders] = React.useState<FarmerOrder[]>([])

  React.useEffect(() => {
    farmerApi
      .getFarmerSales()
      .then((data) => setOrders(data || []))
      .catch(() => setOrders([]))
  }, [])

  return (
    <Panel
      title="Recent Orders"
      description="Latest buyer activity on your listings"
      action={<ViewAll href="/farmer/orders" label="All orders" />}
    >
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
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">
                No recent orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.slice(0, 6).map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <span className="tabular block font-medium">WM-ORD-{o.id}</span>
                  <span className="tabular block text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{o.buyerName}</TableCell>
                <TableCell className="hidden max-w-[180px] truncate text-muted-foreground lg:table-cell">
                  {o.produceName}
                </TableCell>
                <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                  {o.quantity}
                </TableCell>
                <TableCell className="tabular text-right">{LE(o.totalAmount || o.amount)}</TableCell>
                <TableCell className="text-right">
                  <StatusBadge status={o.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Panel>
  )
}

/* ---------------------------- recent buyers ------------------------------- */

export function RecentBuyersPanel() {
  const [orders, setOrders] = React.useState<FarmerOrder[]>([])

  React.useEffect(() => {
    farmerApi
      .getFarmerSales()
      .then((data) => setOrders(data || []))
      .catch(() => setOrders([]))
  }, [])

  // Aggregate unique buyers from orders
  const buyersMap = new Map<number, { name: string; district: string; count: number; lastDate: string }>()
  for (const o of orders) {
    const existing = buyersMap.get(o.buyerId)
    const dateStr = new Date(o.createdAt).toLocaleDateString()
    if (existing) {
      existing.count += 1
      existing.lastDate = dateStr
    } else {
      buyersMap.set(o.buyerId, {
        name: o.buyerName,
        district: o.district || 'Sierra Leone',
        count: 1,
        lastDate: dateStr,
      })
    }
  }
  const recentBuyersList = Array.from(buyersMap.values())

  return (
    <Panel title="Recent Buyers" description="Traders who bought from you">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer</TableHead>
            <TableHead className="hidden sm:table-cell">District</TableHead>
            <TableHead className="text-right">Orders</TableHead>
            <TableHead className="text-right">Last order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBuyersList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                No recent buyers recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            recentBuyersList.map((b) => {
              const initials = b.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
              return (
                <TableRow key={b.name}>
                  <TableCell>
                    <span className="flex items-center gap-2.5">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-secondary text-[11px] text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{b.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {b.district}
                  </TableCell>
                  <TableCell className="tabular text-right">{b.count}</TableCell>
                  <TableCell className="tabular text-right text-muted-foreground">
                    {b.lastDate}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </Panel>
  )
}

/* -------------------------- inventory snapshot ---------------------------- */

export function InventorySnapshotPanel() {
  const { user } = useAuth()
  const [products, setProducts] = React.useState<FarmerProduce[]>([])

  React.useEffect(() => {
    if (user?.id) {
      farmerApi
        .getFarmerProduce(user.id)
        .then((data) => setProducts(data || []))
        .catch(() => setProducts([]))
    }
  }, [user?.id])

  return (
    <Panel
      title="Inventory Snapshot"
      description="Stock levels across your listings"
      action={<ViewAll href="/farmer/products" label="Manage" />}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Price</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                No active inventory listings found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => {
              const low = p.quantity <= 10
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="block font-medium">{p.name}</span>
                    <span className="tabular block text-xs text-muted-foreground">
                      PRD-{p.id}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {p.category}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'tabular inline-flex items-center gap-1.5',
                        low && 'text-destructive',
                      )}
                    >
                      {low && <AlertTriangle className="size-3.5" aria-hidden />}
                      {p.quantity}
                      <span className="text-xs text-muted-foreground">{p.unit}</span>
                    </span>
                  </TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                    {LE(p.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </Panel>
  )
}

/* ---------------------------- recent reviews ------------------------------ */

export function RecentReviewsPanel() {
  const { user } = useAuth()
  const [reviews, setReviews] = React.useState<FarmerReview[]>([])

  React.useEffect(() => {
    if (user?.id) {
      farmerApi
        .getFarmerReviews(user.id)
        .then((data) => setReviews(data || []))
        .catch(() => setReviews([]))
    }
  }, [user?.id])

  return (
    <Panel
      title="Recent Reviews"
      description="What buyers are saying"
      action={<ViewAll href="/farmer/reviews" label="All reviews" />}
      bodyClassName="divide-y divide-border"
    >
      {reviews.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground">
          No reviews received yet.
        </div>
      ) : (
        reviews.slice(0, 4).map((r) => {
          const initials = r.buyerName
            ? r.buyerName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'BY'
          return (
            <div key={r.id} className="flex flex-col gap-1.5 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-secondary text-[11px] text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-medium">{r.buyerName}</span>
                </span>
                <StarRating rating={r.rating} size={13} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
              <p className="tabular text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          )
        })
      )}
    </Panel>
  )
}

/* ------------------------ notifications preview --------------------------- */

const notifIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  order: ShoppingBag,
  product: Package,
  message: MessageSquare,
  broadcast: Megaphone,
}

const notifTone: Record<string, string> = {
  order: 'border-farmer/30 bg-farmer/10 text-farmer',
  product: 'border-gold/40 bg-gold/12 text-[#8a5c10]',
  message: 'border-buyer/30 bg-buyer/10 text-buyer',
  broadcast: 'border-border bg-secondary text-muted-foreground',
}

export function NotificationsPreviewPanel() {
  const [notifications, setNotifications] = React.useState<FarmerNotification[]>([])

  React.useEffect(() => {
    farmerApi
      .getNotifications()
      .then((data) => setNotifications(data || []))
      .catch(() => setNotifications([]))
  }, [])

  return (
    <Panel
      title="Notifications"
      description="Order updates, approvals and notices"
      action={<ViewAll href="/farmer/notifications" label="View all" />}
      bodyClassName="divide-y divide-border"
    >
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground">
          No notifications.
        </div>
      ) : (
        notifications.slice(0, 5).map((n) => {
          const Icon = notifIcon[n.type] || Bell
          return (
            <div key={n.id} className="flex gap-3 px-4 py-3.5">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-md border',
                  notifTone[n.type] || 'border-border bg-secondary text-muted-foreground',
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{n.title}</span>
                  {n.isUnread && (
                    <span
                      aria-label="Unread"
                      className="size-1.5 shrink-0 rounded-full bg-farmer"
                    />
                  )}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )
        })
      )}
    </Panel>
  )
}

/* ----------------------------- quick actions ------------------------------ */

export function QuickActionsPanel() {
  const actions = [
    { label: 'Add Product', icon: PackagePlus, href: '/farmer/products?new=1' },
    { label: 'View Orders', icon: ClipboardList, href: '/farmer/orders' },
    { label: 'Message a Buyer', icon: MessageSquare, href: '/farmer/messages' },
    { label: 'View Payout History', icon: Wallet, href: '/farmer/analytics' },
  ]

  return (
    <Panel
      title="Quick Actions"
      description="Common tasks for your farm"
      bodyClassName="grid grid-cols-2 gap-2 p-4"
    >
      {actions.map((a, i) => {
        const Icon = a.icon
        return (
          <Button
            key={a.label}
            variant={i === 0 ? 'default' : 'outline'}
            nativeButton={false}
            render={<Link href={a.href} />}
            className={cn(
              'h-auto justify-start py-2.5',
              i === 0 && 'bg-farmer text-background hover:bg-farmer/90',
            )}
          >
            <Icon data-icon="inline-start" />
            {a.label}
          </Button>
        )
      })}
      <p className="col-span-2 flex items-start gap-2 rounded-md border border-border bg-secondary/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        <Bell className="mt-px size-3.5 shrink-0" aria-hidden />
        Contact details are never shared outside WiMakit — all buyer conversations
        stay on the platform.
      </p>
    </Panel>
  )
}

