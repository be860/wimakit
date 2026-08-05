import type { Metadata } from 'next'

import { broadcasts } from '@/lib/admin/mock-data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, Panel, StatusBadge } from '@/components/admin/primitives'
import { BroadcastComposer } from '@/components/admin/broadcast-composer'

export const metadata: Metadata = {
  title: 'Broadcast',
}

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications & Broadcast"
        description="Send platform-wide messages and review recent broadcast history."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BroadcastComposer />
        </div>
        <div className="lg:col-span-2">
          <Panel
            title="Sent History"
            description={`${broadcasts.length} recent broadcasts`}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Recipients
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <span className="block max-w-[220px] truncate font-medium">
                        {b.subject}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {b.audience} · {b.channel}
                      </span>
                    </TableCell>
                    <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                      {b.recipients.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </div>
      </div>
    </div>
  )
}
