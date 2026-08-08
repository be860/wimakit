'use client'

import * as React from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Admin route error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-xl font-bold text-foreground">
          Something went wrong loading this page
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        {error?.digest && (
          <p className="tabular text-xs text-muted-foreground/70">Error ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={() => reset()}>
        <RotateCw data-icon="inline-start" />
        Try again
      </Button>
    </div>
  )
}
