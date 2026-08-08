import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Trend } from '@/components/admin/primitives'

export { PageHeader, Panel, Trend } from '@/components/admin/primitives'

/* ------------------------------ StatCard ---------------------------------- */

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  emphasis,
  invertGood,
}: {
  label: string
  value: string
  delta: number
  deltaLabel: string
  icon: React.ComponentType<{ className?: string }>
  emphasis?: boolean
  invertGood?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs leading-relaxed font-medium text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md border border-border',
            emphasis
              ? 'bg-farmer text-background'
              : 'bg-secondary text-muted-foreground',
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="font-display tabular mt-3 text-2xl">{value}</p>
      <div className="mt-1.5">
        <Trend value={delta} label={deltaLabel} invertGood={invertGood} />
      </div>
    </div>
  )
}

/* ---------------------------- StatusBadge --------------------------------- */

const statusStyles: Record<string, string> = {
  Approved: 'border-farmer/30 bg-farmer/10 text-farmer',
  Live: 'border-farmer/30 bg-farmer/10 text-farmer',
  Pending: 'border-gold/40 bg-gold/12 text-[#8a5c10]',
  Processing: 'border-buyer/30 bg-buyer/10 text-buyer',
  Shipped: 'border-buyer/30 bg-buyer/10 text-buyer',
  Delivered: 'border-farmer/30 bg-farmer/10 text-farmer',
  Hidden: 'border-border bg-secondary text-muted-foreground',
  Cancelled: 'border-border bg-secondary text-muted-foreground',
  Rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
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

/* --------------------------- verification --------------------------------- */

export function VerificationBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved: 'border-farmer/30 bg-farmer/10 text-farmer',
    Pending: 'border-gold/40 bg-gold/12 text-[#8a5c10]',
    Suspended: 'border-destructive/30 bg-destructive/10 text-destructive',
  }
  return (
    <Badge
      variant="outline"
      className={cn('rounded-sm px-1.5 font-medium', styles[status])}
    >
      {status === 'Approved' ? 'Verified' : status}
    </Badge>
  )
}

/* --------------------------- star rating ---------------------------------- */

export function StarRating({
  rating,
  size = 14,
  className,
}: {
  rating: number
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i <= Math.round(rating)
              ? 'fill-gold text-gold'
              : 'fill-transparent text-border',
          )}
        />
      ))}
    </span>
  )
}

/* --------------------------- trust score ---------------------------------- */

export function TrustScore({ score, hint }: { score: number; hint?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3">
      <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-full border-2 border-gold bg-background">
        <span className="font-display tabular text-lg leading-none text-[#8a5c10]">
          {score}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-medium text-[#8a5c10]">Trust Score</span>
        {hint && (
          <span className="text-[11px] leading-relaxed text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
    </div>
  )
}
