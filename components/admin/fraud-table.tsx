'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Loader2, Search } from 'lucide-react'

import { adminApi, FraudCase, LE } from '@/lib/admin/api'
import { cn } from '@/lib/utils'
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

const FILTERS = ['All', 'Open', 'Under Review', 'Resolved', 'Rejected']

export function FraudTable() {
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState('All')
  const [cases, setCases] = React.useState<FraudCase[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    adminApi.getFraudCases({ status: filter !== 'All' ? filter : undefined })
      .then(setCases)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const rows = query.trim()
    ? cases.filter((c) =>
        [c.caseNumber, c.orderId, c.buyer, c.farmer, c.reason]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : cases

  return (
    <Panel
      title="All Cases"
      description={loading ? 'Loading…' : `${rows.length} cases`}
      action={
        <InputGroup className="w-[220px]">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Case, order, party…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search fraud cases"
          />
        </InputGroup>
      }
    >
      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              filter === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary',
            )}
          >
            {f}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case</TableHead>
              <TableHead className="hidden md:table-cell">Reason</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Assigned</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No fraud cases found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => (
              <TableRow key={c.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/admin/fraud-cases/${c.id}`} className="block">
                    <span className="block font-medium">{c.caseNumber}</span>
                    <span className="block text-xs text-muted-foreground">
                      {c.orderId} · {c.buyer}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden max-w-[280px] truncate text-muted-foreground md:table-cell">
                  {c.reason}
                </TableCell>
                <TableCell className="tabular hidden text-right sm:table-cell">
                  {LE(c.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {c.assignedTo ?? '—'}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/fraud-cases/${c.id}`}
                    aria-label={`Open case ${c.caseNumber}`}
                    className="flex justify-end text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  )
}
