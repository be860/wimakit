import Link from 'next/link'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-display text-2xl text-balance">{title}</h1>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export function Trend({
  value,
  label,
  invertGood,
}: {
  value: number
  label?: string
  invertGood?: boolean
}) {
  const up = value >= 0
  const good = invertGood ? !up : up
  const Icon = up ? TrendingUp : TrendingDown

  return (
    <span className="flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          'tabular flex items-center gap-0.5 font-medium',
          good ? 'text-farmer' : 'text-destructive',
        )}
      >
        <Icon className="size-3.5" />
        {up ? '+' : ''}
        {value.toFixed(1)}%
      </span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </span>
  )
}

/* -------------------------------------------------------------------------- */

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  emphasis,
  href,
  invertGood,
}: {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  icon: React.ComponentType<{ className?: string }>
  emphasis?: boolean
  href?: string
  invertGood?: boolean
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs leading-relaxed font-medium text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md border border-border',
            emphasis ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="font-display tabular mt-3 text-2xl">{value}</p>
      {delta !== undefined && (
        <div className="mt-1.5">
          <Trend value={delta} label={deltaLabel} invertGood={invertGood} />
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-card"
      >
        <ArrowUpRight className="absolute right-3 bottom-3 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        {body}
      </Link>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">{body}</div>
  )
}

/* -------------------------------------------------------------------------- */

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden py-0 shadow-none', className)}>
      <CardHeader className="flex-row items-center gap-3 border-b border-border px-4 py-3.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <CardTitle className="font-display text-sm">{title}</CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <CardAction className="self-center">{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn('px-0 py-0', bodyClassName)}>{children}</CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */

const statusStyles: Record<string, string> = {
  // Farmers
  Pending: 'border-gold/40 bg-gold/12 text-[#8a5c10]',
  Approved: 'border-farmer/30 bg-farmer/10 text-farmer',
  Rejected: 'border-border bg-secondary text-muted-foreground',
  Suspended: 'border-destructive/30 bg-destructive/10 text-destructive',
  // Buyers
  Active: 'border-farmer/30 bg-farmer/10 text-farmer',
  // Products
  Live: 'border-farmer/30 bg-farmer/10 text-farmer',
  Hidden: 'border-border bg-secondary text-muted-foreground',
  // Fraud
  Open: 'border-destructive/30 bg-destructive/10 text-destructive',
  'Under Review': 'border-gold/40 bg-gold/12 text-[#8a5c10]',
  Resolved: 'border-farmer/30 bg-farmer/10 text-farmer',
  // Orders
  'In Transit': 'border-buyer/30 bg-buyer/10 text-buyer',
  Delivered: 'border-farmer/30 bg-farmer/10 text-farmer',
  Cancelled: 'border-border bg-secondary text-muted-foreground',
  Disputed: 'border-destructive/30 bg-destructive/10 text-destructive',
  // Broadcasts
  Sent: 'border-farmer/30 bg-farmer/10 text-farmer',
  Scheduled: 'border-buyer/30 bg-buyer/10 text-buyer',
  Draft: 'border-border bg-secondary text-muted-foreground',
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-sm px-1.5 font-medium',
        statusStyles[status] ?? 'border-border bg-secondary text-muted-foreground',
        className,
      )}
    >
      {status}
    </Badge>
  )
}

/* -------------------------------------------------------------------------- */

export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    SuperAdmin: 'border-primary/30 bg-primary/10 text-primary',
    Moderator: 'border-buyer/30 bg-buyer/10 text-buyer',
    Finance: 'border-gold/40 bg-gold/12 text-[#8a5c10]',
    Support: 'border-border bg-secondary text-muted-foreground',
  }
  return (
    <Badge
      variant="outline"
      className={cn('rounded-sm px-1.5 font-medium', styles[role])}
    >
      {role}
    </Badge>
  )
}
