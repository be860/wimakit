'use client'

import * as React from 'react'
import { Loader2, Search } from 'lucide-react'

import { adminApi, AuditLogEntry } from '@/lib/admin/api'
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
import { Panel } from '@/components/admin/primitives'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const ACTION_FILTERS = ['All', 'APPROVE', 'SUSPEND', 'UPDATE', 'BROADCAST', 'CREATE']

export function AuditTable() {
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState('All')
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    adminApi.getAuditLogs()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const rows = logs.filter((e) => {
    const matchesFilter = filter === 'All' || e.action.toUpperCase().startsWith(filter)
    const matchesQuery =
      query.trim() === '' ||
      [e.adminName, e.action, e.targetType, e.targetId, e.details]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  return (
    <Panel
      title="Activity Log"
      description={loading ? 'Loading…' : `${rows.length} of ${logs.length} events`}
      action={
        <InputGroup className="w-[220px]">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Actor, action, entity…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search audit log"
          />
        </InputGroup>
      }
    >
      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
        {ACTION_FILTERS.map((f) => (
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
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden lg:table-cell">Target</TableHead>
              <TableHead className="hidden md:table-cell">Details</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No audit log entries found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <span className="block font-medium">{e.adminName}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{e.action}</TableCell>
                <TableCell className="hidden max-w-[200px] truncate lg:table-cell">
                  {e.targetType ? `${e.targetType} #${e.targetId}` : '—'}
                </TableCell>
                <TableCell className="hidden max-w-[240px] truncate md:table-cell text-xs text-muted-foreground">
                  {e.details ?? '—'}
                </TableCell>
                <TableCell className="text-right">
                  <span className="block text-xs">{timeAgo(e.createdAt)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  )
}
