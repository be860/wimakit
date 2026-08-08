'use client'

import * as React from 'react'
import { AlertTriangle, ImagePlus, PackagePlus, Pencil, Search, Trash2 } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { farmerApi, LE, type FarmerProduce } from '@/lib/farmer/api'
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import { Panel, StatusBadge } from '@/components/farmer/primitives'

const productCategories = [
  'Root Crops',
  'Grains & Cereals',
  'Vegetables',
  'Fruits',
  'Legumes',
  'Livestock',
]

const FILTERS = ['All', 'Live', 'Pending', 'Hidden', 'Rejected']

export function ProductsView({ openNew }: { openNew?: boolean }) {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<FarmerProduce[]>([])
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<string>('All')
  const [addOpen, setAddOpen] = React.useState(Boolean(openNew))
  const [detail, setDetail] = React.useState<FarmerProduce | null>(null)
  const [editTarget, setEditTarget] = React.useState<FarmerProduce | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<FarmerProduce | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const fetchProduce = React.useCallback(() => {
    if (user?.id) {
      farmerApi
        .getFarmerProduce(user.id)
        .then((data) => setRows(data || []))
        .catch(() => setRows([]))
    }
  }, [user?.id])

  React.useEffect(() => {
    fetchProduce()
  }, [fetchProduce])

  const visible = rows.filter((p) => {
    const matchFilter = filter === 'All' || p.status === filter
    const matchQuery =
      query.trim() === '' ||
      [p.name, p.category, p.id].join(' ').toLowerCase().includes(query.toLowerCase())
    return matchFilter && matchQuery
  })

  async function handleCreate(form: {
    name: string
    category: string
    price: string
    quantity: string
    description: string
  }) {
    try {
      const created = await farmerApi.createProduce({
        name: form.name || 'Untitled listing',
        category: form.category || 'Root Crops',
        price: Number(form.price || 0),
        unit: 'per kg',
        quantity: Number(form.quantity || 0),
        description: form.description,
      })
      if (created) {
        setRows((prev) => [created, ...prev])
        setAddOpen(false)
        setDetail(created)
      }
    } catch {
      // Ignore error
    }
  }

  async function handleUpdate(
    id: number,
    form: {
      name: string
      category: string
      price: string
      quantity: string
      description: string
    },
  ) {
    try {
      const updated = await farmerApi.updateProduce(id, {
        name: form.name,
        category: form.category,
        price: Number(form.price || 0),
        quantity: Number(form.quantity || 0),
        description: form.description,
      })
      if (updated) {
        setRows((prev) => prev.map((p) => (p.id === id ? updated : p)))
        setEditTarget(null)
      }
    } catch {
      // Ignore error
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await farmerApi.deleteProduce(deleteTarget.id)
      setRows((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
      setDetail(null)
    } catch {
      // Keep dialog open so the farmer can retry
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Panel
        title="Product Listings"
        description={`${visible.length} of ${rows.length} listings`}
        action={
          <div className="flex items-center gap-2">
            <InputGroup className="hidden w-[220px] sm:flex">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Product, category…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
            </InputGroup>
            <Button
              className="bg-farmer text-background hover:bg-farmer/90"
              onClick={() => setAddOpen(true)}
            >
              <PackagePlus data-icon="inline-start" />
              Add Product
            </Button>
          </div>
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
                  ? 'border-farmer bg-farmer text-background'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                Submitted
              </TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-xs text-muted-foreground">
                  No produce listings found.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((p) => {
                const low = p.quantity <= 10
                return (
                  <TableRow
                    key={p.id}
                    onClick={() => setDetail(p)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <span className="block font-medium">{p.name}</span>
                      <span className="tabular block text-xs text-muted-foreground">
                        #{p.id}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {p.category}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {LE(p.price)}
                      <span className="block text-xs text-muted-foreground">
                        {p.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'tabular inline-flex items-center gap-1.5',
                          low && 'text-destructive',
                        )}
                      >
                        {low && <AlertTriangle className="size-3.5" aria-hidden />}
                        {p.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status as any} />
                    </TableCell>
                    <TableCell className="tabular hidden text-right text-muted-foreground lg:table-cell">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
              })
            )}
          </TableBody>
        </Table>
      </Panel>

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} onCreate={handleCreate} />
      <EditProductDialog
        product={editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSave={handleUpdate}
      />
      <DeleteProductDialog
        product={deleteTarget}
        deleting={deleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <ProductDetailDialog
        product={detail}
        onOpenChange={(open) => !open && setDetail(null)}
        onEdit={(p) => {
          setDetail(null)
          setEditTarget(p)
        }}
        onDelete={(p) => {
          setDetail(null)
          setDeleteTarget(p)
        }}
      />
    </>
  )
}


/* ---------------------------- add product --------------------------------- */

function AddProductDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (form: {
    name: string
    category: string
    price: string
    quantity: string
    description: string
  }) => void
}) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState(productCategories[0])
  const [price, setPrice] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [photo, setPhoto] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setName('')
      setPrice('')
      setQuantity('')
      setDescription('')
      setPhoto(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add a new product</DialogTitle>
          <DialogDescription>
            New listings go to the SuperAdmin review queue before buyers can see them.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-product-form"
          onSubmit={(e) => {
            e.preventDefault()
            onCreate({ name, category, price, quantity, description })
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="p-name">Product name</FieldLabel>
              <Input
                id="p-name"
                required
                placeholder="e.g. Cassava (50kg bags)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="p-category">Category</FieldLabel>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as string)}
                >
                  <SelectTrigger id="p-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="p-price">Price (Le)</FieldLabel>
                <Input
                  id="p-price"
                  required
                  inputMode="numeric"
                  placeholder="160000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="p-qty">Quantity available</FieldLabel>
              <Input
                id="p-qty"
                required
                inputMode="numeric"
                placeholder="42"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="p-desc">Description</FieldLabel>
              <Textarea
                id="p-desc"
                rows={3}
                placeholder="Grade, harvest period, packaging…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="p-photo">Product photo</FieldLabel>
              <button
                id="p-photo"
                type="button"
                onClick={() => setPhoto(true)}
                className={cn(
                  'flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm transition-colors',
                  photo
                    ? 'border-farmer/40 bg-farmer/10 text-farmer'
                    : 'bg-secondary/40 text-muted-foreground hover:bg-secondary',
                )}
              >
                <ImagePlus className="size-5" aria-hidden />
                {photo ? 'harvest-photo.jpg uploaded' : 'Click to upload a photo'}
              </button>
              <FieldDescription>
                A clear photo of the crop helps buyers trust your listing.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-product-form"
            className="bg-farmer text-background hover:bg-farmer/90"
          >
            Submit for approval
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
  onSave,
}: {
  product: FarmerProduce | null
  onOpenChange: (open: boolean) => void
  onSave: (
    id: number,
    form: {
      name: string
      category: string
      price: string
      quantity: string
      description: string
    },
  ) => void
}) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState(productCategories[0])
  const [price, setPrice] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [description, setDescription] = React.useState('')

  React.useEffect(() => {
    if (product) {
      setName(product.name)
      setCategory(product.category)
      setPrice(String(product.price))
      setQuantity(String(product.quantity))
      setDescription(product.description || '')
    }
  }, [product])

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Edit {product.name}</DialogTitle>
              <DialogDescription>
                {product.status === 'Live'
                  ? "This listing is live — saving changes sends it back to the SuperAdmin queue for re-approval."
                  : 'Update your listing details.'}
              </DialogDescription>
            </DialogHeader>

            <form
              id="edit-product-form"
              onSubmit={(e) => {
                e.preventDefault()
                onSave(product.id, { name, category, price, quantity, description })
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ep-name">Product name</FieldLabel>
                  <Input
                    id="ep-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="ep-category">Category</FieldLabel>
                    <Select value={category} onValueChange={(v) => setCategory(v as string)}>
                      <SelectTrigger id="ep-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map((c) => (
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

                <Field>
                  <FieldLabel htmlFor="ep-qty">Quantity available</FieldLabel>
                  <Input
                    id="ep-qty"
                    required
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="ep-desc">Description</FieldLabel>
                  <Textarea
                    id="ep-desc"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-product-form"
                className="bg-farmer text-background hover:bg-farmer/90"
              >
                Save changes
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------- delete product ---------------------------------- */

function DeleteProductDialog({
  product,
  deleting,
  onOpenChange,
  onConfirm,
}: {
  product: FarmerProduce | null
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
                This permanently removes #{product.id} from your listings. This can't be undone.
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

/* --------------------------- product detail -------------------------------- */

function ProductDetailDialog({
  product,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  product: FarmerProduce | null
  onOpenChange: (open: boolean) => void
  onEdit: (product: FarmerProduce) => void
  onDelete: (product: FarmerProduce) => void
}) {
  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{product.name}</DialogTitle>
              <DialogDescription className="tabular">
                #{product.id} · submitted {new Date(product.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={product.status as any} />
                {product.quantity <= 10 && (
                  <span className="flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="size-3.5" aria-hidden />
                    Low stock
                  </span>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                {[
                  ['Category', product.category],
                  ['Price', `${LE(product.price)} ${product.unit}`],
                  ['Stock', String(product.quantity)],
                  ['Location', product.location || 'Freetown'],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="tabular">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-sm leading-relaxed">{product.description || 'No description provided.'}</p>
              </div>
            </div>

            <DialogFooter showCloseButton>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(product)}
              >
                <Trash2 data-icon="inline-start" />
                Delete
              </Button>
              <Button
                className="bg-farmer text-background hover:bg-farmer/90"
                onClick={() => onEdit(product)}
              >
                <Pencil data-icon="inline-start" />
                Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

