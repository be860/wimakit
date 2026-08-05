'use client'

import * as React from 'react'
import { Search } from 'lucide-react'

import { auditLog, type AuditEntry } from '@/lib/admin/mock-data'
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
import { Panel, RoleBadge } from '@/components/admin/primitives'

type RoleFilter = 'All' | AuditEntry['role']
const ROLES: RoleFilter[] = ['All', 'SuperAdmin', 'Moderator', 'Finance', 'Support']

export function AuditTable() {
  const [query, setQuery] = React.useState('')
  const [role, setRole] = React.useState<RoleFilter>('All')

  const rows = auditLog.filter((e) => {
    const matchesRole = role === 'All' || e.role === role
    const matchesQuery =
      query.trim() === '' ||
      [e.actor, e.action, e.entity, e.ip, e.id]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    return matchesRole && matchesQuery
  })

  return (
    <Panel
      title="Activity Log"
      description={`${rows.length} of ${auditLog.length} events`}
      action={
        <InputGroup className="w-[220px]">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Actor, action, entity, IP…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search audit log"
          />
        </InputGroup>
      }
    >
      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              role === r
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary',
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="hidden lg:table-cell">Entity</TableHead>
            <TableHead className="hidden md:table-cell">IP / Browser</TableHead>
            <TableHead className="text-right">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <span className="block font-medium">{e.actor}</span>
                <RoleBadge role={e.role} />
              </TableCell>
              <TableCell className="text-muted-foreground">{e.action}</TableCell>
              <TableCell className="hidden max-w-[240px] truncate lg:table-cell">
                {e.entity}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="tabular block text-xs">{e.ip}</span>
                <span className="block text-xs text-muted-foreground">
                  {e.browser}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="block text-xs">{e.ago}</span>
                <span className="block text-xs text-muted-foreground">{e.at}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}
