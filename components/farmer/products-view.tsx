'use client'

import * as React from 'react'
import { AlertTriangle, ImagePlus, PackagePlus, Search } from 'lucide-react'

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

const FILTERS = ['All', 'Approved', 'Pending', 'Hidden']

export function ProductsView({ openNew }: { openNew?: boolean }) {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<FarmerProduce[]>([])
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<string>('All')
  const [addOpen, setAddOpen] = React.useState(Boolean(openNew))
  const [detail, setDetail] = React.useState<FarmerProduce | null>(null)

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

  const [createError, setCreateError] = React.useState<string | null>(null)

  async function handleCreate(form: {
    name: string
    category: string
    price: string
    quantity: string
    description: string
    photo: File | null
  }) {
    setCreateError(null)
    try {
      // Upload the photo first (if one was selected) so we have a URL to
      // attach to the listing. Previously `form.photo` was accepted but
      // never sent anywhere, so every listing was created with no image.
      let imageUrl: string | undefined
      if (form.photo) {
        const uploaded = await farmerApi.uploadImage(form.photo)
        imageUrl = uploaded?.imageUrl
      }

      const created = await farmerApi.createProduce({
        name: form.name || 'Untitled listing',
        category: form.category || 'Root Crops',
        price: Number(form.price || 0),
        unit: 'per kg',
        quantity: Number(form.quantity || 0),
        description: form.description,
        imageUrl,
      })
      if (created) {
        setRows((prev) => [created, ...prev])
        setAddOpen(false)
        setDetail(created)
      }
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Could not create this listing. Please try again.',
      )
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
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
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Panel>

      <AddProductDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) setCreateError(null)
        }}
        onCreate={handleCreate}
        error={createError}
      />
      <ProductDetailDialog
        product={detail}
        onOpenChange={(open) => !open && setDetail(null)}
      />
    </>
  )
}


/* ---------------------------- add product --------------------------------- */

function AddProductDialog({
  open,
  onOpenChange,
  onCreate,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (form: {
    name: string
    category: string
    price: string
    quantity: string
    description: string
    photo: File | null
  }) => void | Promise<void>
  error?: string | null
}) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState(productCategories[0])
  const [price, setPrice] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [photo, setPhoto] = React.useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) {
      setName('')
      setPrice('')
      setQuantity('')
      setDescription('')
      setPhoto(null)
      setPhotoPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setSubmitting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [open])

  // Revoke the object URL on unmount so we don't leak memory.
  React.useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    }
  }, [photoPreviewUrl])

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    setPhoto(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onCreate({ name, category, price, quantity, description, photo })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* flex column with a capped height: header and footer stay fixed,
          only the form body scrolls, so nothing gets pushed off-screen */}
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-display">Add a new product</DialogTitle>
          <DialogDescription>
            New listings go to the SuperAdmin review queue before buyers can see them.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4">
          <form id="add-product-form" onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

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
                <input
                  ref={fileInputRef}
                  id="p-photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm transition-colors',
                    photo
                      ? 'border-farmer/40 bg-farmer/10 text-farmer'
                      : 'bg-secondary/40 text-muted-foreground hover:bg-secondary',
                  )}
                >
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt="Selected product"
                      className="mb-1 h-20 w-20 rounded-md object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-5" aria-hidden />
                  )}
                  {photo ? photo.name : 'Click to upload a photo'}
                </button>
                <FieldDescription>
                  A clear photo of the crop helps buyers trust your listing.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-product-form"
            disabled={submitting}
            className="bg-farmer text-background hover:bg-farmer/90"
          >
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------- product detail -------------------------------- */

function ProductDetailDialog({
  product,
  onOpenChange,
}: {
  product: FarmerProduce | null
  onOpenChange: (open: boolean) => void
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

            <DialogFooter showCloseButton />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

