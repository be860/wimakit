'use client'

import * as React from 'react'
import { Ban, Check, Loader2, RotateCcw, Search, X } from 'lucide-react'

import { adminApi, BuyerAdmin, LE } from '@/lib/admin/api'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Panel, StatusBadge } from '@/components/admin/primitives'

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended']

export function BuyersTable({ initialStatus }: { initialStatus?: string }) {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState(
    STATUSES.includes(initialStatus ?? '') ? (initialStatus as string) : 'All',
  )
  const [buyers, setBuyers] = React.useState<BuyerAdmin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [resolving, setResolving] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    setLoading(true)
    adminApi.getBuyers({
      status: status !== 'All' ? status : undefined,
      search: query.trim() || undefined,
    })
      .then(setBuyers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  const rows = query.trim()
    ? buyers.filter((b) =>
        [b.name, b.organization, b.email, b.district ?? '']
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : buyers

  async function updateStatus(id: number, newStatus: string) {
    setResolving((r) => ({ ...r, [id]: newStatus }))
    try {
      await adminApi.updateBuyerStatus(id, newStatus)
    } catch {
      setResolving((r) => { const s = { ...r }; delete s[id]; return s })
    }
  }

  return (
    <Panel
      title="Buyer Directory"
      description={loading ? 'Loading…' : `${rows.length} records shown`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="w-[220px]">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buyer or organization…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search buyers"
            />
          </InputGroup>
          <Select value={status} onValueChange={(val) => setStatus(val ?? 'All')}>
            <SelectTrigger className="w-[132px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s === 'All' ? 'All statuses' : s}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      }
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <Empty className="border-0 py-12">
          <EmptyHeader>
            <EmptyTitle>No buyers match these filters</EmptyTitle>
            <EmptyDescription>
              Try clearing the search term or choosing a different status.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer</TableHead>
              <TableHead className="hidden lg:table-cell">Type</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Spend</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => {
              const state = resolving[b.id]
              const currentStatus = state ?? b.status
              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <span className="block font-medium">{b.organization}</span>
                    <span className="block text-xs text-muted-foreground">
                      {b.name} · {b.email}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {b.type}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{b.district ?? '—'}</TableCell>
                  <TableCell className="tabular text-right">{b.orders}</TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground lg:table-cell">
                    {LE(b.spend)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={currentStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    {!state && currentStatus === 'Pending' && (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" onClick={() => updateStatus(b.id, 'Approved')}>
                          <Check data-icon="inline-start" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'Rejected')}>
                          <X data-icon="inline-start" /> Reject
                        </Button>
                      </div>
                    )}
                    {!state && currentStatus === 'Approved' && (
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, 'Suspended')}>
                        <Ban data-icon="inline-start" />
                        Suspend
                      </Button>
                    )}
                    {!state && (currentStatus === 'Suspended' || currentStatus === 'Rejected') && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'Approved')}>
                        <RotateCcw data-icon="inline-start" />
                        Reinstate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Panel>
  )
}
