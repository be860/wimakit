'use client'

import * as React from 'react'
import { Bell, CheckCheck, Megaphone, MessageSquare, Package, ShoppingBag } from 'lucide-react'

import { farmerApi, type FarmerNotification } from '@/lib/farmer/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/farmer/primitives'

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  order: ShoppingBag,
  product: Package,
  message: MessageSquare,
  broadcast: Megaphone,
}

const tones: Record<string, string> = {
  order: 'border-farmer/30 bg-farmer/10 text-farmer',
  product: 'border-gold/40 bg-gold/12 text-[#8a5c10]',
  message: 'border-buyer/30 bg-buyer/10 text-buyer',
  broadcast: 'border-border bg-secondary text-muted-foreground',
}

const FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'order', label: 'Orders' },
  { value: 'product', label: 'Approvals' },
  { value: 'message', label: 'Messages' },
  { value: 'broadcast', label: 'Broadcasts' },
]

export function NotificationsFeed() {
  const [items, setItems] = React.useState<FarmerNotification[]>([])
  const [filter, setFilter] = React.useState<string>('all')

  const fetchNotifications = React.useCallback(() => {
    farmerApi
      .getNotifications()
      .then((data) => setItems(data || []))
      .catch(() => setItems([]))
  }, [])

  React.useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const visible = items.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return n.isUnread
    return n.type === filter
  })

  const unread = items.filter((n) => n.isUnread).length

  function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isUnread: false })))
    items.forEach((n) => {
      if (n.isUnread) farmerApi.markNotificationRead(n.id).catch(() => {})
    })
  }

  function handleMarkSingleRead(id: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isUnread: false } : i)))
    farmerApi.markNotificationRead(id).catch(() => {})
  }

  return (
    <Panel
      title="Notification Feed"
      description={`${unread} unread of ${items.length}`}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
        >
          <CheckCheck data-icon="inline-start" />
          Mark all read
        </Button>
      }
      bodyClassName="divide-y divide-border"
    >
      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              filter === f.value
                ? 'border-farmer bg-farmer text-background'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="p-6 text-center text-xs text-muted-foreground">
          No notifications found for this filter.
        </div>
      ) : (
        visible.map((n) => {
          const Icon = icons[n.type] || Bell
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => handleMarkSingleRead(n.id)}
              className={cn(
                'flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50',
                n.isUnread && 'bg-farmer/5',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-md border',
                  tones[n.type] || 'border-border bg-secondary text-muted-foreground',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{n.title}</span>
                  {n.isUnread && (
                    <span
                      aria-label="Unread"
                      className="size-1.5 shrink-0 rounded-full bg-farmer"
                    />
                  )}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {n.body}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </span>
            </button>
          )
        })
      )}
    </Panel>
  )
}

