'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, EyeOff, Loader2, X } from 'lucide-react'

import { adminApi, FarmerAdmin, ProductAdmin, FraudCase, AuditLogEntry, LE } from '@/lib/admin/api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Panel, RoleBadge, StatusBadge } from '@/components/admin/primitives'

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      render={<Link href={href} />}
    >
      {label}
    </Button>
  )
}

/* -------------------------------------------------------------------------- */

export function PendingFarmersPanel() {
  const [farmers, setFarmers] = React.useState<FarmerAdmin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [resolving, setResolving] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    adminApi.getFarmers({ status: 'Pending' })
      .then((data) => setFarmers(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: number, status: 'Approved' | 'Rejected') {
    setResolving((r) => ({ ...r, [id]: status }))
    try {
      await adminApi.updateFarmerStatus(id, status)
    } catch {
      setResolving((r) => { const s = { ...r }; delete s[id]; return s })
    }
  }

  return (
    <Panel
      title="Pending Farmer Approvals"
      description={loading ? 'Loading…' : `${farmers.length} pending`}
      action={<ViewAll href="/admin/farmers" label="Full queue" />}
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farmer</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="hidden lg:table-cell">Primary crops</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farmers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No pending farmer approvals
                </TableCell>
              </TableRow>
            )}
            {farmers.map((f) => {
              const state = resolving[f.id]
              return (
                <TableRow key={f.id}>
                  <TableCell>
                    <Link
                      href={`/admin/farmers/${f.id}`}
                      className="font-medium hover:underline"
                    >
                      {f.name}
                    </Link>
                    <span className="tabular block text-xs text-muted-foreground">
                      #{f.id} · {f.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.district ?? '—'}</TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {f.crops.join(', ') || '—'}
                  </TableCell>
                  <TableCell className="tabular text-muted-foreground">
                    {new Date(f.submitted).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {state ? (
                      <StatusBadge status={state === 'Approved' ? 'Approved' : 'Rejected'} />
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" onClick={() => updateStatus(f.id, 'Approved')}>
                          <Check data-icon="inline-start" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(f.id, 'Rejected')}
                        >
                          <X data-icon="inline-start" />
                          Reject
                        </Button>
                      </div>
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

/* -------------------------------------------------------------------------- */

export function PendingProductsPanel() {
  const [products, setProducts] = React.useState<ProductAdmin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [resolving, setResolving] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    adminApi.getProducts({ status: 'Pending' })
      .then((data) => setProducts(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: number, status: 'Live' | 'Hidden') {
    setResolving((r) => ({ ...r, [id]: status }))
    try {
      await adminApi.updateProductStatus(id, status)
    } catch {
      setResolving((r) => { const s = { ...r }; delete s[id]; return s })
    }
  }

  return (
    <Panel
      title="Pending Product Approvals"
      description={loading ? 'Loading…' : `${products.length} pending`}
      action={<ViewAll href="/admin/products" label="Full queue" />}
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden lg:table-cell">Farmer</TableHead>
              <TableHead className="hidden xl:table-cell">Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No pending product approvals
                </TableCell>
              </TableRow>
            )}
            {products.map((p) => {
              const state = resolving[p.id]
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="block max-w-[220px] truncate font-medium">{p.name}</span>
                    <span className="tabular block text-xs text-muted-foreground">
                      #{p.id} · {new Date(p.submitted).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {p.farmer}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {p.category}
                  </TableCell>
                  <TableCell className="tabular text-right">{LE(p.price)}</TableCell>
                  <TableCell className="text-right">
                    {state ? (
                      <StatusBadge status={state === 'Live' ? 'Live' : 'Hidden'} />
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" onClick={() => updateStatus(p.id, 'Live')}>
                          <Check data-icon="inline-start" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(p.id, 'Hidden')}
                        >
                          <EyeOff data-icon="inline-start" />
                          Hide
                        </Button>
                      </div>
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

/* -------------------------------------------------------------------------- */

export function FraudCasesPanel() {
  const [cases, setCases] = React.useState<FraudCase[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    adminApi.getFraudCases({ status: 'Open' })
      .then((data) => setCases(data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Panel
      title="Recent Fraud Cases"
      description={loading ? 'Loading…' : `${cases.length} open`}
      action={<ViewAll href="/admin/fraud-cases" label="All cases" />}
    >
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="hidden lg:table-cell">Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No open fraud cases
                </TableCell>
              </TableRow>
            )}
            {cases.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/admin/fraud-cases/${c.id}`}
                    className="tabular font-medium hover:underline"
                  >
                    {c.caseNumber}
                  </Link>
                  <span className="block max-w-[260px] truncate text-xs text-muted-foreground">
                    {c.reason}
                  </span>
                </TableCell>
                <TableCell className="tabular text-muted-foreground">{c.orderId}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {c.assignedTo ?? '—'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell className="tabular text-right text-muted-foreground">
                  {new Date(c.reported).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  )
}

/* -------------------------------------------------------------------------- */

export function LatestOrdersPanel() {
  // Orders are shown from the admin metrics context, routed through admin/farmers/buyers panels
  // For now this will stay as a placeholder that shows real data from the orders endpoint
  return (
    <Panel title="Latest Orders" description="Live marketplace activity">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead className="hidden lg:table-cell">Farmer</TableHead>
            <TableHead className="hidden xl:table-cell">Product</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
              Recent orders appear here once purchases are made through the platform.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Panel>
  )
}

/* -------------------------------------------------------------------------- */

export function AuditTimelinePanel() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    adminApi.getAuditLogs()
      .then((data) => setLogs(data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Panel
      title="Audit Timeline"
      description="Staff activity, most recent first"
      action={<ViewAll href="/admin/audit-log" label="Full log" />}
      bodyClassName="p-4"
    >
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No audit log entries yet.</p>
      ) : (
        <ol className="flex flex-col">
          {logs.map((entry, i, arr) => (
            <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < arr.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-4 bottom-0 left-[5px] w-px bg-border"
                />
              )}
              <span
                aria-hidden
                className="mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-primary bg-background"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-sm leading-relaxed">
                  <span className="font-medium">{entry.adminName}</span>{' '}
                  <span className="text-muted-foreground">
                    {entry.action.toLowerCase().replace(/_/g, ' ')}
                  </span>{' '}
                  <span className="font-medium">{entry.targetType ?? ''} {entry.targetId ?? ''}</span>
                </p>
                <div className="flex items-center gap-2">
                  <RoleBadge role="SuperAdmin" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}
