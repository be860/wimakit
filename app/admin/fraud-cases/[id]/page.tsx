import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ImageIcon } from 'lucide-react'

import { LE, fraudCases, fraudThread } from '@/lib/admin/mock-data'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Panel, StatusBadge, RoleBadge } from '@/components/admin/primitives'

export default async function FraudCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const fraudCase = fraudCases.find((c) => c.id === id)
  if (!fraudCase) notFound()

  const facts: Array<{ label: string; value: string }> = [
    { label: 'Case ID', value: fraudCase.id },
    { label: 'Order reference', value: fraudCase.orderId },
    { label: 'Buyer', value: fraudCase.buyer },
    { label: 'Farmer', value: fraudCase.farmer },
    { label: 'Disputed amount', value: LE(fraudCase.amount) },
    { label: 'Reported', value: fraudCase.reported },
    { label: 'Assigned to', value: fraudCase.assignedTo },
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
              <h1 className="font-display text-2xl">{fraudCase.id}</h1>
              <StatusBadge status={fraudCase.status} />
            </div>
            <p className="text-sm text-muted-foreground">{fraudCase.reason}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm">
              Reject claim
            </Button>
            <Button size="sm">Mark resolved</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Panel title="Response Thread" bodyClassName="p-4">
            <ol className="flex flex-col gap-4">
              {fraudThread.map((msg, i) => (
                <li key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{msg.author}</span>
                    <RoleBadge role={msg.role} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {msg.at}
                    </span>
                  </div>
                  <p className="rounded-md border border-border bg-secondary/50 p-3 text-sm leading-relaxed">
                    {msg.body}
                  </p>
                </li>
              ))}
            </ol>
            <Separator className="my-4" />
            <div className="flex flex-col gap-2">
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
                <span className="text-xs">Uploaded delivery photo</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
