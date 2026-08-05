'use client'

import * as React from 'react'
import { Ban, Loader2, RotateCcw, Search } from 'lucide-react'

import { adminApi, BuyerAdmin, LE } from '@/lib/admin/api'
import { Button } from '@/components/ui/button'
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
import { Panel, StatusBadge } from '@/components/admin/primitives'

export function BuyersTable() {
  const [query, setQuery] = React.useState('')
  const [buyers, setBuyers] = React.useState<BuyerAdmin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [overrides, setOverrides] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    adminApi.getBuyers()
      .then(setBuyers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const rows = query.trim()
    ? buyers.filter((b) =>
        [b.name, b.organization, b.email, b.district ?? '']
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : buyers

  async function updateStatus(id: number, newStatus: string) {
    setOverrides((o) => ({ ...o, [id]: newStatus }))
    try {
      await adminApi.updateBuyerStatus(id, newStatus)
    } catch {
      setOverrides((o) => { const s = { ...o }; delete s[id]; return s })
    }
  }

  return (
    <Panel
      title="Buyer Directory"
      description={loading ? 'Loading…' : `${rows.length} records shown`}
      action={
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
      }
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
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
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No buyers found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((b) => {
              const status = overrides[b.id] ?? b.status
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
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {status === 'Suspended' ? (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'Active')}>
                        <RotateCcw data-icon="inline-start" />
                        Reinstate
                      </Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, 'Suspended')}>
                        <Ban data-icon="inline-start" />
                        Suspend
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
