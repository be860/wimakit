'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { adminApi, NotificationItem } from '@/lib/admin/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { BroadcastComposer } from '@/components/admin/broadcast-composer'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationsPage() {
  const [broadcasts, setBroadcasts] = React.useState<NotificationItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // Load existing notifications (null userId = global broadcasts)
  React.useEffect(() => {
    adminApi.getNotifications()
      .then((items) => setBroadcasts(Array.isArray(items) ? items.filter((n) => n.userId === null || n.userId === undefined) : []))
      .catch(() => setBroadcasts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications & Broadcast"
        description="Send platform-wide messages and review recent broadcast history."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BroadcastComposer onSent={(item) => setBroadcasts((prev) => [item, ...prev])} />
        </div>
        <div className="lg:col-span-2">
          <Panel
            title="Sent History"
            description={loading ? 'Loading…' : `${broadcasts.length} broadcasts`}
          >
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {broadcasts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="py-6 text-center text-muted-foreground text-sm">
                        No broadcasts sent yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {broadcasts.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <span className="block max-w-[220px] truncate font-medium">
                          {b.title}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate max-w-[220px]">
                          {b.body}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {timeAgo(b.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
