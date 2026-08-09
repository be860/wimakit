'use client'

import * as React from 'react'
import { Loader2, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react'

import { categoriesApi, type Category } from '@/lib/admin/api'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Panel } from '@/components/admin/primitives'

type FormState = {
  id: number | null
  name: string
  slug: string
  commission: string
  active: boolean
}

const EMPTY_FORM: FormState = { id: null, name: '', slug: '', commission: '', active: true }

export function CategoriesTable() {
  const [rows, setRows] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [togglingId, setTogglingId] = React.useState<number | null>(null)

  const [formOpen, setFormOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await categoriesApi.getAll()
      setRows(data)
    } catch (err: any) {
      setLoadError(err.data?.message || err.message || 'Could not load categories.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function toggle(category: Category) {
    setTogglingId(category.id)
    // Optimistic update, rolled back on failure.
    setRows((prev) => prev.map((c) => (c.id === category.id ? { ...c, active: !c.active } : c)))
    try {
      await categoriesApi.toggleActive(category.id)
    } catch (err) {
      setRows((prev) => prev.map((c) => (c.id === category.id ? { ...c, active: category.active } : c)))
    } finally {
      setTogglingId(null)
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      commission: String(category.commission),
      active: category.active,
    })
    setFormError(null)
    setFormOpen(true)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const commissionValue = Number(form.commission)
    if (!form.name.trim()) {
      setFormError('Category name is required.')
      return
    }
    if (Number.isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      setFormError('Commission must be a number between 0 and 100.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        commission: commissionValue,
        active: form.active,
      }

      if (form.id == null) {
        const created = await categoriesApi.create(payload)
        setRows((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      } else {
        const updated = await categoriesApi.update(form.id, payload)
        setRows((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      }

      setFormOpen(false)
    } catch (err: any) {
      setFormError(err.data?.message || err.message || 'Could not save this category.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    setDeleting(true)
    try {
      await categoriesApi.remove(deleteTarget.id)
      setRows((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err: any) {
      setDeleteError(err.data?.message || err.message || 'Could not delete this category.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Panel
        title="Categories"
        description={loading ? 'Loading…' : `${rows.length} marketplace categories`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus data-icon="inline-start" />
            New category
          </Button>
        }
      >
        {loadError && (
          <Alert variant="destructive" className="mb-4 border-destructive/30 bg-destructive/10">
            <TriangleAlert />
            <AlertTitle>Could not load categories</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Products</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No categories yet. Create your first one to get started.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {c.slug}
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">{c.productCount}</TableCell>
                  <TableCell className="tabular text-right">{c.commission.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Switch
                      checked={c.active}
                      onCheckedChange={() => toggle(c)}
                      disabled={togglingId === c.id}
                      aria-label={`Toggle ${c.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Edit ${c.name}`}
                        onClick={() => openEdit(c)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Delete ${c.name}`}
                        onClick={() => {
                          setDeleteError(null)
                          setDeleteTarget(c)
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Panel>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id == null ? 'New category' : 'Edit category'}</DialogTitle>
            <DialogDescription>
              {form.id == null
                ? 'Add a product category and set its commission rate.'
                : "Update this category's details."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitForm} className="flex flex-col gap-4">
            {formError && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                <TriangleAlert />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Grains & Cereals"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category-slug">Slug (optional)</Label>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto-generated from name if left blank"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category-commission">Commission (%)</Label>
              <Input
                id="category-commission"
                required
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.commission}
                onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
                placeholder="5.0"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="category-active" className="cursor-pointer">
                Active
              </Label>
              <Switch
                id="category-active"
                checked={form.active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 data-icon="inline-start" className="animate-spin" />}
                {saving ? 'Saving…' : form.id == null ? 'Create category' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  This permanently deletes <strong>{deleteTarget.name}</strong>. This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <TriangleAlert />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {deleting ? 'Deleting…' : 'Delete category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
