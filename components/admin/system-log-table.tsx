'use client'

import * as React from 'react'
import { Loader2, RefreshCw, Search } from 'lucide-react'

import { adminApi, type RequestLogEntry } from '@/lib/admin/api'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

function statusTone(status: number) {
  if (status >= 500) return 'text-destructive'
  if (status >= 400) return 'text-gold-foreground'
  if (status >= 200 && status < 300) return 'text-farmer'
  return 'text-muted-foreground'
}

const METHOD_TONE: Record<string, string> = {
  GET: 'bg-muted text-muted-foreground',
  POST: 'bg-farmer/10 text-farmer',
  PUT: 'bg-gold/10 text-gold-foreground',
  PATCH: 'bg-gold/10 text-gold-foreground',
  DELETE: 'bg-destructive/10 text-destructive',
}

export function SystemLogTable() {
  const [query, setQuery] = React.useState('')
  const [logs, setLogs] = React.useState<RequestLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    adminApi
      .getSystemLogs(300)
      .then(setLogs)
      .catch((err: any) => setError(err.data?.message || err.message || 'Could not load system logs.'))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = logs.filter((l) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      l.path.toLowerCase().includes(q) ||
      l.method.toLowerCase().includes(q) ||
      (l.userEmail ?? '').toLowerCase().includes(q) ||
      (l.userRole ?? '').toLowerCase().includes(q) ||
      (l.ipAddress ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <Panel
      title="All Requests"
      description={loading ? 'Loading…' : `${filtered.length} of ${logs.length} recent requests`}
      action={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search path, user, IP…"
              className="h-7 w-56 pl-7 text-xs"
            />
          </div>
          <Button size="icon-sm" variant="outline" onClick={load} aria-label="Refresh">
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
          </Button>
        </div>
      }
    >
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <div className="max-h-[560px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Path</TableHead>
              <TableHead className="hidden md:table-cell">User</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Duration</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No requests recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                        METHOD_TONE[l.method] ?? 'bg-muted text-muted-foreground',
                      )}
                    >
                      {l.method}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate font-mono text-xs">{l.path}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {l.userEmail ? (
                      <div className="flex flex-col">
                        <span className="text-xs">{l.userEmail}</span>
                        {l.userRole && (
                          <span className="text-[11px] text-muted-foreground">{l.userRole}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Anonymous</span>
                    )}
                  </TableCell>
                  <TableCell className={cn('hidden font-mono text-xs sm:table-cell', statusTone(l.statusCode))}>
                    {l.statusCode}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-xs text-muted-foreground lg:table-cell">
                    {l.durationMs}ms
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {timeAgo(l.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}
