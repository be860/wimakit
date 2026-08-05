'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Check,
  FileImage,
  Loader2,
  ShieldQuestion,
  X,
} from 'lucide-react'

import { adminApi, FarmerAdmin, LE } from '@/lib/admin/api'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Panel, StatusBadge } from '@/components/admin/primitives'

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-2.5 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

export default function FarmerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const [farmer, setFarmer] = React.useState<FarmerAdmin | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)

  React.useEffect(() => {
    adminApi.getFarmers()
      .then((list) => {
        const found = list.find((f) => String(f.id) === String(id))
        if (found) setFarmer(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function updateStatus(status: string) {
    if (!farmer) return
    setUpdating(true)
    try {
      await adminApi.updateFarmerStatus(farmer.id, status)
      setFarmer((prev) => prev ? { ...prev, status } : prev)
    } catch {
      // TODO: show error toast
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !farmer) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/admin/farmers" />}>
          <ArrowLeft data-icon="inline-start" />
          Back to farmers
        </Button>
        <p className="text-muted-foreground">Farmer not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          render={<Link href="/admin/farmers" />}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to farmers
        </Button>

        <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl">{farmer.name}</h1>
              <StatusBadge status={farmer.status} />
              {farmer.verified ? (
                <span className="flex items-center gap-1 text-xs text-farmer">
                  <BadgeCheck className="size-3.5" />
                  NIN verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldQuestion className="size-3.5" />
                  Awaiting NIN verification
                </span>
              )}
            </div>
            <p className="tabular text-sm text-muted-foreground">
              #{farmer.id} · {farmer.phone ?? '—'} · Submitted {farmer.submitted}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => updateStatus('Approved')} disabled={updating || farmer.status === 'Approved'}>
              <Check data-icon="inline-start" />
              Approve
            </Button>
            <Button variant="outline" onClick={() => updateStatus('Rejected')} disabled={updating}>
              <X data-icon="inline-start" />
              Reject
            </Button>
            <Button variant="destructive" onClick={() => updateStatus('Suspended')} disabled={updating}>
              <Ban data-icon="inline-start" />
              Suspend
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Identity" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail label="Full name" value={farmer.name} />
            <Detail
              label="National Identification Number"
              value={<span className="tabular">{farmer.nin ?? '—'}</span>}
            />
            <Detail label="Phone" value={<span className="tabular">{farmer.phone ?? '—'}</span>} />
            <Detail
              label="Verification status"
              value={farmer.verified ? 'Verified against NCRA records' : 'Not yet verified'}
            />
          </dl>
        </Panel>

        <Panel title="Location" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail label="District" value={farmer.district ?? '—'} />
            <Detail label="Chiefdom" value={farmer.chiefdom ?? '—'} />
            <Detail label="Community" value={'—'} />
            <Detail label="Nearest market" value="District produce market" />
          </dl>
        </Panel>

        <Panel title="Farm details" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail label="Primary crops" value={farmer.crops?.join(', ') || '—'} />
            <Detail label="Farm size" value={farmer.farmSize ?? '—'} />
            <Detail label="Experience" value={farmer.farmSize ?? '—'} />
            <Detail
              label="Active listings"
              value={<span className="tabular">{farmer.listings}</span>}
            />
          </dl>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Trust score" bodyClassName="p-4" className="xl:col-span-1">
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <span className="font-display tabular text-3xl">
                {farmer.trustScore}
                <span className="text-base text-muted-foreground">/100</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {farmer.trustScore >= 80
                  ? 'Low risk'
                  : farmer.trustScore >= 55
                    ? 'Moderate risk'
                    : 'High risk'}
              </span>
            </div>
            <Progress value={farmer.trustScore} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Weighted from delivery reliability, dispute history, buyer ratings, and
              identity verification.
            </p>
            <dl className="flex flex-col pt-1">
              <Detail
                label="Lifetime sales"
                value={
                  <span className="tabular">
                    {farmer.totalSales > 0 ? LE(farmer.totalSales) : '—'}
                  </span>
                }
              />
              <Detail label="Open disputes" value="0" />
            </dl>
          </div>
        </Panel>

        <Panel
          title="Uploaded documents"
          description="Placeholder previews — file storage integration pending"
          bodyClassName="p-4"
          className="xl:col-span-2"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              'National ID (front)',
              'National ID (back)',
              'Farm photograph 1',
              'Farm photograph 2',
            ].map((label) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/50 px-2 py-6 text-center"
              >
                <FileImage className="size-5 text-muted-foreground" />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
