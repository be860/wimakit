'use client'

import * as React from 'react'
import { Check, EyeOff, Loader2, Search } from 'lucide-react'

import { adminApi, ProductAdmin, LE } from '@/lib/admin/api'
import { cn } from '@/lib/utils'
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

const CATALOG_FILTERS = ['All', 'Pending', 'Live', 'Hidden', 'Rejected']

export function ProductApprovalQueue() {
  const [products, setProducts] = React.useState<ProductAdmin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [decided, setDecided] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    adminApi.getProducts({ status: 'Pending' })
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: number, status: string) {
    setDecided((s) => ({ ...s, [id]: status }))
    try {
      await adminApi.updateProductStatus(id, status)
    } catch {
      setDecided((s) => { const c = { ...s }; delete c[id]; return c })
    }
  }

  return (
    <Panel
      title="Approval Queue"
      description={loading ? 'Loading…' : `${products.length} listings awaiting moderation`}
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Farmer</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No products pending approval.
                </TableCell>
              </TableRow>
            )}
            {products.map((p) => {
              const decision = decided[p.id]
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="block font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      #{p.id} · {p.district ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {p.category}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {p.farmer}
                  </TableCell>
                  <TableCell className="tabular text-right">{LE(p.price)}</TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                    {new Date(p.submitted).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {decision ? (
                      <StatusBadge status={decision === 'Live' ? 'Live' : 'Hidden'} />
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" onClick={() => updateStatus(p.id, 'Live')}>
                          <Check data-icon="inline-start" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, 'Hidden')}>
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

export function ProductCatalog() {
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState('All')
  const [products, setProducts] = React.useState<ProductAdmin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [overrides, setOverrides] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    setLoading(true)
    adminApi.getProducts({ status: filter !== 'All' ? filter : undefined })
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const rows = query.trim()
    ? products.filter((p) =>
        [p.name, p.farmer, p.category].join(' ').toLowerCase().includes(query.toLowerCase()),
      )
    : products

  async function updateStatus(id: number, status: string) {
    setOverrides((o) => ({ ...o, [id]: status }))
    try {
      await adminApi.updateProductStatus(id, status)
    } catch {
      setOverrides((o) => { const c = { ...o }; delete c[id]; return c })
    }
  }

  return (
    <Panel
      title="Full Catalog"
      description={loading ? 'Loading…' : `${rows.length} listings`}
      action={
        <InputGroup className="w-[220px]">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Product, farmer, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </InputGroup>
      }
    >
      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-3">
        {CATALOG_FILTERS.map((f) => (
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
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Farmer</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((p) => {
              const status = overrides[p.id] ?? p.status
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="block font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      #{p.id} · {p.farmer}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {p.category}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {p.farmer}
                  </TableCell>
                  <TableCell className="tabular text-right">{LE(p.price)}</TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                    {p.stock} {p.unit}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {status === 'Live' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, 'Hidden')}>
                        <EyeOff data-icon="inline-start" /> Hide
                      </Button>
                    )}
                    {status === 'Hidden' && (
                      <Button size="sm" onClick={() => updateStatus(p.id, 'Live')}>
                        <Check data-icon="inline-start" /> Show
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
