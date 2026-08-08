'use client'

import * as React from 'react'
import { Check, EyeOff, Loader2, PackagePlus, Pencil, Search, Trash2 } from 'lucide-react'

import { adminApi, ProductAdmin, FarmerAdmin, LE } from '@/lib/admin/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Panel, StatusBadge } from '@/components/admin/primitives'

const CATALOG_FILTERS = ['All', 'Pending', 'Live', 'Hidden', 'Rejected']

const PRODUCT_CATEGORIES = [
  'Root Crops',
  'Grains & Cereals',
  'Vegetables',
  'Fruits',
  'Legumes',
  'Livestock',
]

const PRODUCT_STATUSES = ['Pending', 'Live', 'Hidden', 'Rejected']

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
                        <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, 'Rejected')}>
                          <EyeOff data-icon="inline-start" />
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

export function ProductCatalog() {
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState('All')
  const [products, setProducts] = React.useState<ProductAdmin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [overrides, setOverrides] = React.useState<Record<number, string>>({})
  const [addOpen, setAddOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<ProductAdmin | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<ProductAdmin | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const loadProducts = React.useCallback(() => {
    setLoading(true)
    adminApi.getProducts({ status: filter !== 'All' ? filter : undefined })
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  React.useEffect(() => {
    loadProducts()
  }, [loadProducts])

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

  function handleCreated(product: ProductAdmin) {
    setProducts((prev) => [product, ...prev])
    setAddOpen(false)
  }

  function handleUpdated(product: ProductAdmin) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
    setOverrides((o) => { const c = { ...o }; delete c[product.id]; return c })
    setEditTarget(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteProduct(deleteTarget.id)
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // Keep the dialog open so the admin can retry
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Panel
        title="Full Catalog"
        description={loading ? 'Loading…' : `${rows.length} listings`}
        action={
          <div className="flex items-center gap-2">
            <InputGroup className="hidden w-[220px] sm:flex">
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
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <PackagePlus data-icon="inline-start" />
              Add Product
            </Button>
          </div>
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
                      <div className="flex justify-end gap-1">
                        {status === 'Live' && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, 'Hidden')}>
                            <EyeOff data-icon="inline-start" /> Hide
                          </Button>
                        )}
                        {status !== 'Live' && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, 'Live')}>
                            <Check data-icon="inline-start" /> {status === 'Pending' ? 'Approve' : 'Show'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Edit ${p.name}`}
                          onClick={() => setEditTarget(p)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Delete ${p.name}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Panel>

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} onCreated={handleCreated} />
      <EditProductDialog
        product={editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onUpdated={handleUpdated}
      />
      <DeleteProductDialog
        product={deleteTarget}
        deleting={deleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

/* ---------------------------- add product --------------------------------- */

function AddProductDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (product: ProductAdmin) => void
}) {
  const [farmers, setFarmers] = React.useState<FarmerAdmin[]>([])
  const [farmerId, setFarmerId] = React.useState<string>('')
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState(PRODUCT_CATEGORIES[0])
  const [price, setPrice] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [unit, setUnit] = React.useState('per kg')
  const [district, setDistrict] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [status, setStatus] = React.useState('Live')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      adminApi.getFarmers().then(setFarmers).catch(() => setFarmers([]))
    } else {
      setName('')
      setPrice('')
      setQuantity('')
      setUnit('per kg')
      setDistrict('')
      setDescription('')
      setStatus('Live')
      setFarmerId('')
      setError(null)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!farmerId) {
      setError('Select which farmer this listing belongs to.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const created = await adminApi.createProduct({
        farmerId: Number(farmerId),
        name: name || 'Untitled listing',
        category,
        description,
        price: Number(price || 0),
        unit,
        quantity: Number(quantity || 0),
        district: district || undefined,
        status,
      })
      if (created) onCreated(created)
    } catch {
      setError('Could not create the product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add a product</DialogTitle>
          <DialogDescription>
            Create a listing on behalf of a farmer. Since you're adding it directly, you choose
            whether it publishes immediately or waits in the review queue.
          </DialogDescription>
        </DialogHeader>

        <form id="admin-add-product-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ap-farmer">Farmer</FieldLabel>
              <Select value={farmerId} onValueChange={(v) => setFarmerId((v as string) ?? '')}>
                <SelectTrigger id="ap-farmer">
                  <SelectValue placeholder="Select a farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="ap-name">Product name</FieldLabel>
              <Input
                id="ap-name"
                required
                placeholder="e.g. Cassava (50kg bags)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ap-category">Category</FieldLabel>
                <Select value={category} onValueChange={(v) => setCategory(v as string)}>
                  <SelectTrigger id="ap-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="ap-price">Price (Le)</FieldLabel>
                <Input
                  id="ap-price"
                  required
                  inputMode="numeric"
                  placeholder="160000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ap-qty">Quantity available</FieldLabel>
                <Input
                  id="ap-qty"
                  required
                  inputMode="numeric"
                  placeholder="42"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ap-district">District</FieldLabel>
                <Input
                  id="ap-district"
                  placeholder="e.g. Bo"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="ap-desc">Description</FieldLabel>
              <Textarea
                id="ap-desc"
                rows={3}
                placeholder="Grade, harvest period, packaging…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ap-status">Publish status</FieldLabel>
              <Select value={status} onValueChange={(v) => setStatus(v as string)}>
                <SelectTrigger id="ap-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Live">Live (visible to buyers now)</SelectItem>
                  <SelectItem value="Pending">Pending (send to review queue)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="admin-add-product-form" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------- edit product ---------------------------------- */

function EditProductDialog({
  product,
  onOpenChange,
  onUpdated,
}: {
  product: ProductAdmin | null
  onOpenChange: (open: boolean) => void
  onUpdated: (product: ProductAdmin) => void
}) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [stock, setStock] = React.useState('')
  const [district, setDistrict] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (product) {
      setName(product.name)
      setCategory(product.category)
      setPrice(String(product.price))
      setStock(String(product.stock))
      setDistrict(product.district ?? '')
      setStatus(product.status)
      setError(null)
    }
  }, [product])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    setSubmitting(true)
    setError(null)
    try {
      const updated = await adminApi.updateProduct(product.id, {
        name,
        category,
        price: Number(price || 0),
        quantity: Number(stock || 0),
        district: district || undefined,
        status,
      })
      if (updated) onUpdated(updated)
    } catch {
      setError('Could not update the product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Edit {product.name}</DialogTitle>
              <DialogDescription>#{product.id} · {product.farmer}</DialogDescription>
            </DialogHeader>

            <form id="admin-edit-product-form" onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ep-name">Product name</FieldLabel>
                  <Input id="ep-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="ep-category">Category</FieldLabel>
                    <Select value={category} onValueChange={(v) => setCategory(v as string)}>
                      <SelectTrigger id="ep-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ep-price">Price (Le)</FieldLabel>
                    <Input
                      id="ep-price"
                      required
                      inputMode="numeric"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="ep-stock">Stock</FieldLabel>
                    <Input
                      id="ep-stock"
                      required
                      inputMode="numeric"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ep-district">District</FieldLabel>
                    <Input id="ep-district" value={district} onChange={(e) => setDistrict(e.target.value)} />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="ep-status">Status</FieldLabel>
                  <Select value={status} onValueChange={(v) => setStatus(v as string)}>
                    <SelectTrigger id="ep-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="admin-edit-product-form" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------- delete product -------------------------------- */

function DeleteProductDialog({
  product,
  deleting,
  onOpenChange,
  onConfirm,
}: {
  product: ProductAdmin | null
  deleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Delete {product.name}?</DialogTitle>
              <DialogDescription>
                This permanently removes #{product.id} from the catalog. This can't be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete product'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
