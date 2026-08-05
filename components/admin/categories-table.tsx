'use client'

import * as React from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Panel } from '@/components/admin/primitives'

// Categories are managed locally (no backend endpoint yet).
// Edits here are in-session only until a categories API is added.
interface Category {
  id: string
  name: string
  slug: string
  products: number
  commission: number
  active: boolean
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'grains', name: 'Grains & Cereals', slug: 'grains-cereals', products: 0, commission: 5.0, active: true },
  { id: 'vegetables', name: 'Vegetables', slug: 'vegetables', products: 0, commission: 4.5, active: true },
  { id: 'fruits', name: 'Fruits', slug: 'fruits', products: 0, commission: 4.5, active: true },
  { id: 'roots', name: 'Roots & Tubers', slug: 'roots-tubers', products: 0, commission: 5.0, active: true },
  { id: 'livestock', name: 'Livestock', slug: 'livestock', products: 0, commission: 6.0, active: true },
  { id: 'fish', name: 'Fish & Seafood', slug: 'fish-seafood', products: 0, commission: 5.5, active: true },
  { id: 'processed', name: 'Processed Foods', slug: 'processed-foods', products: 0, commission: 6.5, active: false },
]

export function CategoriesTable() {
  const [rows, setRows] = React.useState<Category[]>(DEFAULT_CATEGORIES)

  function toggle(id: string) {
    setRows((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    )
  }

  return (
    <Panel
      title="Categories"
      description={`${rows.length} marketplace categories`}
      action={
        <Button size="sm">
          <Plus data-icon="inline-start" />
          New category
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Slug</TableHead>
            <TableHead className="text-right">Commission</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                {c.slug}
              </TableCell>
              <TableCell className="tabular text-right">
                {c.commission.toFixed(1)}%
              </TableCell>
              <TableCell>
                <Switch
                  checked={c.active}
                  onCheckedChange={() => toggle(c.id)}
                  aria-label={`Toggle ${c.name}`}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button size="icon-sm" variant="ghost" aria-label={`Edit ${c.name}`}>
                    <Pencil />
                  </Button>
                  <Button size="icon-sm" variant="ghost" aria-label={`Delete ${c.name}`}>
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  )
}
