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

function DocPreview({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/50 px-2 py-6 text-center">
        <FileImage className="size-5 text-muted-foreground" />
        <span className="text-xs leading-relaxed text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground/70">Not uploaded</span>
      </div>
    )
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-1.5 overflow-hidden rounded-md border border-border transition-colors hover:border-farmer/50"
    >
      <img src={url} alt={label} className="h-28 w-full object-cover" />
      <span className="px-2 pb-2 text-xs text-muted-foreground group-hover:text-foreground">
        {label}
      </span>
    </a>
  )
}

export default function FarmerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const [farmer, setFarmer] = React.useState<FarmerAdmin | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)

  React.useEffect(() => {
    adminApi.getFarmerById(Number(id))
      .then((found) => setFarmer(found))
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
          <div className="flex items-center gap-4">
            {farmer.profilePhotoUrl ? (
              <img
                src={farmer.profilePhotoUrl}
                alt={`${farmer.name} profile photo`}
                className="size-16 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-secondary/50">
                <FileImage className="size-5 text-muted-foreground" />
              </div>
            )}
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
                #{farmer.id} · {farmer.phone ?? '—'} · {farmer.email} · Submitted {farmer.submitted}
              </p>
            </div>
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
            <Detail label="Email" value={farmer.email} />
            <Detail
              label="National Identification Number"
              value={<span className="tabular">{farmer.nin ?? '—'}</span>}
            />
            <Detail label="Document type" value={farmer.idDocumentType ?? '—'} />
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
            <Detail label="Community" value={farmer.community ?? '—'} />
            <Detail label="Nearest market" value="District produce market" />
          </dl>
        </Panel>

        <Panel title="Farm details" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail label="Farm / business name" value={farmer.farmName ?? '—'} />
            <Detail label="Farm address" value={farmer.farmAddress ?? '—'} />
            <Detail label="Primary crops" value={farmer.crops?.join(', ') || '—'} />
            <Detail label="Farm size" value={farmer.farmSize ?? '—'} />
            <Detail label="Experience" value={farmer.farmingExperience ?? '—'} />
            <Detail
              label="Active listings"
              value={<span className="tabular">{farmer.listings}</span>}
            />
          </dl>
        </Panel>
      </div>

      {farmer.farmDescription && (
        <Panel title="About the farm" bodyClassName="p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{farmer.farmDescription}</p>
        </Panel>
      )}

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
          title="Uploaded documents & photos"
          description="Full registration evidence submitted by the farmer"
          bodyClassName="p-4"
          className="xl:col-span-2"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DocPreview label="Profile photo" url={farmer.profilePhotoUrl} />
            <DocPreview label="Farm photo" url={farmer.farmPhotoUrl} />
            <DocPreview
              label={`${farmer.idDocumentType ?? 'ID document'} (front)`}
              url={farmer.idDocumentFrontUrl}
            />
            <DocPreview
              label={`${farmer.idDocumentType ?? 'ID document'} (back)`}
              url={farmer.idDocumentBackUrl}
            />
          </div>
        </Panel>
      </div>
    </div>
  )
}
