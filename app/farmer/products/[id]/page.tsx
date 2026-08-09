'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, ImageOff, Loader2, Pencil, Trash2 } from 'lucide-react'

import { farmerApi, LE, type FarmerProduce } from '@/lib/farmer/api'
import { Button } from '@/components/ui/button'
import { Panel, StatusBadge } from '@/components/farmer/primitives'
import {
  DeleteProductDialog,
  EditProductDialog,
} from '@/components/farmer/products-view'

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-2.5 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

export default function FarmerProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const [product, setProduct] = React.useState<FarmerProduce | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    farmerApi.getProduceById(Number(id))
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(
    productId: number,
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
      const updated = await farmerApi.updateProduce(productId, {
        name: form.name,
        category: form.category,
        price: Number(form.price || 0),
        quantity: Number(form.quantity || 0),
        description: form.description,
        imageUrl: form.imageUrl ?? '',
      })
      if (updated) {
        setProduct(updated)
        setEditOpen(false)
      }
    } catch {
      // Ignore error
    }
  }

  async function handleDelete() {
    if (!product) return
    setDeleting(true)
    try {
      await farmerApi.deleteProduce(product.id)
      router.push('/farmer/products')
    } catch {
      setDeleting(false)
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
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/farmer/products" />}>
          <ArrowLeft data-icon="inline-start" />
          Back to my products
        </Button>
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  const low = product.quantity <= 10

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/farmer/products" />}>
          <ArrowLeft data-icon="inline-start" />
          Back to my products
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
                <StatusBadge status={product.status as any} />
                {low && (
                  <span className="flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="size-3.5" />
                    Low stock
                  </span>
                )}
              </div>
              <p className="tabular text-sm text-muted-foreground">
                #{product.id} · Submitted {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
            <Button
              className="bg-farmer text-background hover:bg-farmer/90"
              onClick={() => setEditOpen(true)}
            >
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
            <Detail label="Quantity available" value={<span className="tabular">{product.quantity}</span>} />
            <Detail label="Location" value={product.location || 'Freetown'} />
          </dl>
        </Panel>

        <Panel title="Status" bodyClassName="px-4 py-2" className="xl:col-span-2">
          <dl className="flex flex-col">
            <Detail label="Current status" value={<StatusBadge status={product.status as any} />} />
            <Detail
              label="What this means"
              value={
                product.status === 'Live'
                  ? 'Visible to buyers on the marketplace.'
                  : product.status === 'Pending'
                    ? 'Waiting for a SuperAdmin to review before it goes live.'
                    : product.status === 'Rejected'
                      ? 'A SuperAdmin rejected this listing. Edit it and resubmit for review.'
                      : 'Hidden from buyers by a SuperAdmin.'
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
            <span className="text-xs text-muted-foreground">
              No photo uploaded yet — buyers trust listings with a clear photo more.
            </span>
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
        onSave={handleSave}
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
