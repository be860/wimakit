'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, ImageIcon, Loader2 } from 'lucide-react'

import { adminApi, FraudCase, LE } from '@/lib/admin/api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Panel, StatusBadge } from '@/components/admin/primitives'

export default function FraudCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const [fraudCase, setFraudCase] = React.useState<FraudCase | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)

  React.useEffect(() => {
    adminApi.getFraudCases()
      .then((list) => {
        const found = list.find((c) => String(c.id) === String(id))
        if (found) setFraudCase(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function updateStatus(status: string) {
    if (!fraudCase) return
    setUpdating(true)
    try {
      await adminApi.updateFraudCase(fraudCase.id, status)
      setFraudCase((prev) => prev ? { ...prev, status } : prev)
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

  if (notFound || !fraudCase) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit -ml-2" render={<Link href="/admin/fraud-cases" />}>
          <ArrowLeft data-icon="inline-start" />
          Back to cases
        </Button>
        <p className="text-muted-foreground">Fraud case not found.</p>
      </div>
    )
  }

  const facts: Array<{ label: string; value: string }> = [
    { label: 'Case ID', value: fraudCase.caseNumber },
    { label: 'Order reference', value: String(fraudCase.orderId ?? '—') },
    { label: 'Buyer', value: fraudCase.buyer },
    { label: 'Farmer', value: fraudCase.farmer },
    { label: 'Disputed amount', value: LE(fraudCase.amount) },
    { label: 'Reported', value: fraudCase.reported },
    { label: 'Assigned to', value: fraudCase.assignedTo ?? '—' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground"
          nativeButton={false}
          render={<Link href="/admin/fraud-cases" />}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to cases
        </Button>
        <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl">{fraudCase.caseNumber}</h1>
              <StatusBadge status={fraudCase.status} />
            </div>
            <p className="text-sm text-muted-foreground">{fraudCase.reason}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus('Rejected')}
              disabled={updating || fraudCase.status === 'Rejected'}
            >
              Reject claim
            </Button>
            <Button
              size="sm"
              onClick={() => updateStatus('Resolved')}
              disabled={updating || fraudCase.status === 'Resolved'}
            >
              Mark resolved
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Panel title="Case Notes" bodyClassName="p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                No notes yet. Add an internal note below.
              </p>
              <Separator className="my-2" />
              <Textarea
                placeholder="Add an internal note or reply to the parties…"
                rows={3}
              />
              <div className="flex justify-end">
                <Button size="sm">Post response</Button>
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Case Details" bodyClassName="p-4">
            <dl className="flex flex-col gap-3 text-sm">
              {facts.map((f) => (
                <div key={f.label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="text-right font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Evidence" bodyClassName="p-4">
            <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-secondary/50 text-muted-foreground">
              <div className="flex flex-col items-center gap-1.5">
                <ImageIcon className="size-6" />
                <span className="text-xs">No evidence uploaded</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
