'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Check, EyeOff, ImageOff, Loader2, Pencil, Trash2 } from 'lucide-react'

import { adminApi, ProductAdmin, LE } from '@/lib/admin/api'
import { getErrorMessage } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Panel, StatusBadge } from '@/components/admin/primitives'
import { DeleteProductDialog, EditProductDialog } from '@/components/admin/products-table'

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-2.5 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

export default function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const [product, setProduct] = React.useState<ProductAdmin | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    adminApi.getProductById(Number(id))
      .then((found) => setProduct(found))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function updateStatus(status: string) {
    if (!product) return
    const wasPending = product.status === 'Pending'
    setUpdating(true)
    try {
      await adminApi.updateProductStatus(product.id, status)
      setProduct((prev) => (prev ? { ...prev, status } : prev))
      const successText =
        status === 'Live'
          ? wasPending
            ? 'Product approved.'
            : 'Product is now visible to buyers.'
          : status === 'Hidden'
            ? 'Product hidden.'
            : status === 'Rejected'
              ? 'Product rejected.'
              : 'Product status updated.'
      toast.success(successText)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update the product status. Please try again.'))
    } finally {
      setUpdating(false)
    }
  }

  function handleUpdated(updated: ProductAdmin) {
    setProduct(updated)
    setEditOpen(false)
  }

  async function handleDelete() {
    if (!product) return
    setDeleting(true)
    try {
      await adminApi.deleteProduct(product.id)
      router.push('/admin/products')
    } catch (err) {
      setDeleting(false)
      toast.error(getErrorMessage(err, 'Could not delete the product. Please try again.'))
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/admin/products" />}>
          <ArrowLeft data-icon="inline-start" />
          Back to products
        </Button>
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/admin/products" />}>
          <ArrowLeft data-icon="inline-start" />
          Back to products
        </Button>

        <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={`${product.name} photo`}
                className="size-16 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50">
                <ImageOff className="size-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl">{product.name}</h1>
                <StatusBadge status={product.status} />
              </div>
              <p className="tabular text-sm text-muted-foreground">
                #{product.id} · {product.farmer} · Submitted {new Date(product.submitted).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.status !== 'Live' && (
              <Button onClick={() => updateStatus('Live')} disabled={updating}>
                <Check data-icon="inline-start" />
                {product.status === 'Pending' ? 'Approve' : 'Show'}
              </Button>
            )}
            {product.status === 'Live' && (
              <Button variant="outline" onClick={() => updateStatus('Hidden')} disabled={updating}>
                <EyeOff data-icon="inline-start" />
                Hide
              </Button>
            )}
            {product.status !== 'Rejected' && (
              <Button variant="outline" onClick={() => updateStatus('Rejected')} disabled={updating}>
                <EyeOff data-icon="inline-start" />
                Reject
              </Button>
            )}
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Listing details" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail label="Category" value={product.category} />
            <Detail label="Price" value={<span className="tabular">{LE(product.price)} {product.unit}</span>} />
            <Detail label="Stock" value={<span className="tabular">{product.stock}</span>} />
            <Detail label="District / Location" value={product.district ?? product.location ?? '—'} />
          </dl>
        </Panel>

        <Panel title="Farmer" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail
              label="Farmer"
              value={
                <Link href={`/admin/farmers/${product.farmerId}`} className="hover:underline">
                  {product.farmer}
                </Link>
              }
            />
            <Detail label="Farmer ID" value={<span className="tabular">#{product.farmerId}</span>} />
          </dl>
        </Panel>

        <Panel title="Moderation status" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail label="Current status" value={<StatusBadge status={product.status} />} />
            <Detail
              label="What this means"
              value={
                product.status === 'Live'
                  ? 'Visible to buyers on the marketplace.'
                  : product.status === 'Pending'
                    ? 'Awaiting review in the approval queue.'
                    : product.status === 'Rejected'
                      ? 'Rejected — hidden from buyers until the farmer edits and resubmits.'
                      : 'Hidden from buyers.'
              }
            />
          </dl>
        </Panel>
      </div>

      <Panel title="Photo" bodyClassName="p-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product.name} photo`}
            className="max-h-96 w-full rounded-md border border-border object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/50 px-2 py-10 text-center">
            <ImageOff className="size-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">No photo uploaded for this listing.</span>
          </div>
        )}
      </Panel>

      <Panel title="Description" bodyClassName="p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description || 'No description provided.'}
        </p>
      </Panel>

      <EditProductDialog
        product={editOpen ? product : null}
        onOpenChange={(open) => setEditOpen(open)}
        onUpdated={handleUpdated}
      />
      <DeleteProductDialog
        product={deleteOpen ? product : null}
        deleting={deleting}
        onOpenChange={(open) => setDeleteOpen(open)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
