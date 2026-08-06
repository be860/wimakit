'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, Loader2, Search, X } from 'lucide-react'

import { adminApi, FarmerAdmin, LE } from '@/lib/admin/api'
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
import { Button } from '@/components/ui/button'

const SL_DISTRICTS = [
  'Waterloo', 'Rokel', 'Tombo', 'Newton', 'Benguema',
  'Grafton', 'Hastings', 'Regent', 'Goderich', 'York',
  'Kent', 'Tokeh', 'Mama Beach', 'Kerry Town', 'Russell',
  'Campbell Town', 'Songo', 'Leicester', 'Gloucester',
  'Bathurst', 'Charlotte', 'Dublin (Banana Islands)',
]

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended']

export function FarmersTable({ initialStatus }: { initialStatus?: string }) {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState(
    STATUSES.includes(initialStatus ?? '') ? (initialStatus as string) : 'All',
  )
  const [district, setDistrict] = React.useState('All')
  const [farmers, setFarmers] = React.useState<FarmerAdmin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [resolving, setResolving] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    setLoading(true)
    adminApi.getFarmers({
      status: status !== 'All' ? status : undefined,
      search: query.trim() || undefined,
      district: district !== 'All' ? district : undefined,
    })
      .then(setFarmers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, district])

  const rows = query.trim()
    ? farmers.filter((f) =>
        [f.name, f.email, f.district ?? '', f.chiefdom ?? '', ...f.crops]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : farmers

  async function updateStatus(id: number, newStatus: string) {
    setResolving((r) => ({ ...r, [id]: newStatus }))
    try {
      await adminApi.updateFarmerStatus(id, newStatus)
    } catch {
      setResolving((r) => { const s = { ...r }; delete s[id]; return s })
    }
  }

  return (
    <Panel
      title="Farmer Directory"
      description={loading ? 'Loading…' : `${rows.length} records shown`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="w-[200px]">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Name, email, crops…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search farmers"
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
          <Select value={district} onValueChange={(val) => setDistrict(val ?? 'All')}>
            <SelectTrigger className="w-[168px]" aria-label="Filter by district">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All districts</SelectItem>
                {SL_DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
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
            <EmptyTitle>No farmers match these filters</EmptyTitle>
            <EmptyDescription>
              Try clearing the search term or widening the district filter.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farmer</TableHead>
              <TableHead>District / Chiefdom</TableHead>
              <TableHead className="hidden lg:table-cell">Crops</TableHead>
              <TableHead className="text-right">Trust</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Total sales</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((f) => {
              const state = resolving[f.id]
              return (
                <TableRow key={f.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {f.profilePhotoUrl ? (
                        <img
                          src={f.profilePhotoUrl}
                          alt=""
                          className="size-8 shrink-0 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-secondary/50 text-[10px] text-muted-foreground">
                          {f.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <Link href={`/admin/farmers/${f.id}`} className="font-medium hover:underline">
                          {f.name}
                        </Link>
                        <span className="tabular block text-xs text-muted-foreground">
                          #{f.id} · {f.phone ?? f.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.district ?? '—'}
                    <span className="block text-xs">{f.chiefdom ?? ''}</span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {f.crops.join(', ') || '—'}
                  </TableCell>
                  <TableCell className="tabular text-right">{f.trustScore}</TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground lg:table-cell">
                    {f.totalSales > 0 ? LE(f.totalSales) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={state ?? f.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {!state && f.status === 'Pending' && (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" onClick={() => updateStatus(f.id, 'Approved')}>
                          <Check data-icon="inline-start" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(f.id, 'Rejected')}>
                          <X data-icon="inline-start" /> Reject
                        </Button>
                      </div>
                    )}
                    {!state && f.status === 'Approved' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(f.id, 'Suspended')}>
                        Suspend
                      </Button>
                    )}
                    {!state && f.status === 'Suspended' && (
                      <Button size="sm" onClick={() => updateStatus(f.id, 'Approved')}>
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
