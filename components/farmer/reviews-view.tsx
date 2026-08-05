'use client'

import * as React from 'react'
import { CornerDownRight, Send } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { farmerApi, type FarmerReview, type RatingDistribution } from '@/lib/farmer/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, StarRating } from '@/components/farmer/primitives'

export function ReviewsView() {
  const { user } = useAuth()
  const [reviews, setReviews] = React.useState<FarmerReview[]>([])
  const [distribution, setDistribution] = React.useState<RatingDistribution | null>(null)
  const [drafts, setDrafts] = React.useState<Record<number, string>>({})
  const [loading, setLoading] = React.useState(false)

  const fetchData = React.useCallback(() => {
    if (user?.id) {
      farmerApi.getFarmerReviews(user.id).then((data) => setReviews(data || [])).catch(() => setReviews([]))
      farmerApi.getRatingDistribution(user.id).then((dist) => setDistribution(dist)).catch(() => setDistribution(null))
    }
  }, [user?.id])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const total = distribution?.totalReviews || reviews.length
  const average = distribution?.averageRating || (total > 0 ? reviews.reduce((n, r) => n + r.rating, 0) / total : 0)

  async function handleReply(reviewId: number) {
    const text = (drafts[reviewId] ?? '').trim()
    if (!text) return

    setLoading(true)
    try {
      await farmerApi.replyToReview(reviewId, text)
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, reply: text } : r)),
      )
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }

  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = distribution?.stars?.[stars] ?? reviews.filter((r) => Math.round(r.rating) === stars).length
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return { stars, count, pct }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Rating Summary"
          description={`${total} reviews from verified buyers`}
          bodyClassName="flex flex-col items-center gap-1 p-5"
        >
          <p className="font-display tabular text-4xl">{average.toFixed(1)}</p>
          <StarRating rating={average} size={18} />
          <p className="text-xs text-muted-foreground">Average rating</p>
        </Panel>

        <Panel
          title="Star Distribution"
          description="How buyers rated your produce"
          className="lg:col-span-2"
          bodyClassName="flex flex-col gap-2.5 p-4"
        >
          {starCounts.map((r) => (
            <div key={r.stars} className="flex items-center gap-3">
              <span className="tabular w-12 shrink-0 text-xs text-muted-foreground">
                {r.stars} star
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <span
                  className="block h-full rounded-full bg-gold"
                  style={{ width: `${r.pct}%` }}
                />
              </span>
              <span className="tabular w-14 shrink-0 text-right text-xs text-muted-foreground">
                {r.count} · {r.pct}%
              </span>
            </div>
          ))}
        </Panel>
      </div>

      <Panel
        title="All Reviews"
        description="Reply publicly to build buyer trust"
        bodyClassName="divide-y divide-border"
      >
        {reviews.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No reviews received yet.
          </div>
        ) : (
          reviews.map((r) => {
            const initials = r.buyerName
              ? r.buyerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'BY'
            return (
              <div key={r.id} className="flex flex-col gap-2.5 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-secondary text-[11px] text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{r.buyerName}</span>
                      <span className="tabular text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </span>
                  <StarRating rating={r.rating} size={14} />
                </div>

                <p className="text-sm leading-relaxed">{r.comment}</p>

                {r.reply ? (
                  <p className="flex gap-2 rounded-md border border-border bg-secondary/50 p-2.5 text-sm leading-relaxed">
                    <CornerDownRight
                      className="mt-0.5 size-3.5 shrink-0 text-farmer"
                      aria-hidden
                    />
                    <span>
                      <span className="font-medium">Your reply: </span>
                      {r.reply}
                    </span>
                  </p>
                ) : (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleReply(r.id)
                    }}
                  >
                    <Input
                      value={drafts[r.id] ?? ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))
                      }
                      placeholder="Write a reply…"
                      aria-label={`Reply to ${r.buyerName}`}
                      disabled={loading}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon"
                      aria-label="Post reply"
                      disabled={loading || !(drafts[r.id] ?? '').trim()}
                    >
                      <Send />
                    </Button>
                  </form>
                )}
              </div>
            )
          })
        )}
      </Panel>
    </div>
  )
}

