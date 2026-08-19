'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, ImagePlus, PackagePlus, Pencil, Search, Trash2 } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { farmerApi, LE, type FarmerProduce } from '@/lib/farmer/api'
import { getErrorMessage } from '@/lib/api-client'
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
  const router = useRouter()
  const [rows, setRows] = React.useState<FarmerProduce[]>([])
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<string>('All')
  const [addOpen, setAddOpen] = React.useState(Boolean(openNew))
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
    imageUrl: string | null
  }) {
    try {
      const created = await farmerApi.createProduce({
        name: form.name || 'Untitled listing',
        category: form.category || 'Root Crops',
        price: Number(form.price || 0),
        unit: 'per kg',
        quantity: Number(form.quantity || 0),
        description: form.description,
        imageUrl: form.imageUrl || undefined,
      })
      if (created) {
        setRows((prev) => [created, ...prev])
        setAddOpen(false)
        toast.success('Product created successfully.')
        router.push(`/farmer/products/${created.id}`)
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create the product. Please try again.'))
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
      imageUrl: string | null
    },
  ) {
    try {
      const updated = await farmerApi.updateProduce(id, {
        name: form.name,
        category: form.category,
        price: Number(form.price || 0),
        quantity: Number(form.quantity || 0),
        description: form.description,
        imageUrl: form.imageUrl ?? '',
      })
      if (updated) {
        setRows((prev) => prev.map((p) => (p.id === id ? updated : p)))
        setEditTarget(null)
        toast.success('Product updated successfully.')
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update the product. Please try again.'))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await farmerApi.deleteProduce(deleteTarget.id)
      setRows((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('Product deleted.')
    } catch (err) {
      // Keep dialog open so the farmer can retry
      toast.error(getErrorMessage(err, 'Could not delete the product. Please try again.'))
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
                    onClick={() => router.push(`/farmer/products/${p.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="size-8 shrink-0 rounded-md border border-border object-cover"
                          />
                        ) : (
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-secondary/50 text-[10px] text-muted-foreground">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/farmer/products/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium hover:underline"
                          >
                            {p.name}
                          </Link>
                          <span className="tabular block text-xs text-muted-foreground">
                            #{p.id}
                          </span>
                        </div>
                      </div>
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
    </>
  )
}


/* ---------------------------- image field ----------------------------------- */

function ProductImageField({
  imageUrl,
  onChange,
}: {
  imageUrl: string | null
  onChange: (url: string | null) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const res = await farmerApi.uploadProduceImage(file)
      onChange(res.imageUrl)
    } catch {
      setError('Could not upload image. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor="p-photo">Product photo</FieldLabel>
      <input
        ref={inputRef}
        id="p-photo"
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      {imageUrl ? (
        <div className="flex items-center gap-3">
          <img
            src={imageUrl}
            alt=""
            className="size-16 shrink-0 rounded-md border border-border object-cover"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Replace'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => onChange(null)}
              disabled={uploading}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          id="p-photo-trigger"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-6 text-center text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ImagePlus className="size-5" aria-hidden />
          {uploading ? 'Uploading…' : 'Click to upload a photo'}
        </button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <FieldDescription>
        A clear photo of the crop helps buyers trust your listing. JPG, PNG, GIF, or WEBP, up to 5MB.
      </FieldDescription>
    </Field>
  )
}

/* ---------------------------- add product --------------------------------- */

export function AddProductDialog({
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
    imageUrl: string | null
  }) => void
}) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState(productCategories[0])
  const [price, setPrice] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setName('')
      setPrice('')
      setQuantity('')
      setDescription('')
      setImageUrl(null)
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
            onCreate({ name, category, price, quantity, description, imageUrl })
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

            <ProductImageField imageUrl={imageUrl} onChange={setImageUrl} />
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

export function EditProductDialog({
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
      imageUrl: string | null
    },
  ) => void
}) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState(productCategories[0])
  const [price, setPrice] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (product) {
      setName(product.name)
      setCategory(product.category)
      setPrice(String(product.price))
      setQuantity(String(product.quantity))
      setDescription(product.description || '')
      setImageUrl(product.imageUrl || null)
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
                onSave(product.id, { name, category, price, quantity, description, imageUrl })
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

                <ProductImageField imageUrl={imageUrl} onChange={setImageUrl} />
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

export function DeleteProductDialog({
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

