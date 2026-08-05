import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Check,
  FileImage,
  ShieldQuestion,
  X,
} from 'lucide-react'

import { LE, farmers } from '@/lib/admin/mock-data'
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

export default async function FarmerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const farmer = farmers.find((f) => f.id === id)

  if (!farmer) notFound()

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
              {farmer.id} · {farmer.phone} · Submitted {farmer.submitted}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button>
              <Check data-icon="inline-start" />
              Approve
            </Button>
            <Button variant="outline">
              <X data-icon="inline-start" />
              Reject
            </Button>
            <Button variant="destructive">
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
              value={<span className="tabular">{farmer.nin}</span>}
            />
            <Detail label="Phone" value={<span className="tabular">{farmer.phone}</span>} />
            <Detail
              label="Verification status"
              value={farmer.verified ? 'Verified against NCRA records' : 'Not yet verified'}
            />
          </dl>
        </Panel>

        <Panel title="Location" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail label="District" value={farmer.district} />
            <Detail label="Chiefdom" value={farmer.chiefdom} />
            <Detail label="Community" value={farmer.community} />
            <Detail label="Nearest market" value="District produce market" />
          </dl>
        </Panel>

        <Panel title="Farm details" bodyClassName="px-4 py-2">
          <dl className="flex flex-col">
            <Detail label="Primary crops" value={farmer.crops.join(', ')} />
            <Detail label="Farm size" value={`${farmer.farmSizeHa} hectares`} />
            <Detail label="Farming since" value={String(farmer.farmingSince)} />
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
          description="Placeholder previews — file storage arrives with backend work"
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
