'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Compass } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const pathname = usePathname()
  const { user } = useAuth()

  const inAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/control')
  const inFarmer = pathname?.startsWith('/farmer')

  let backHref = '/'
  let backLabel = 'Back to home'

  if (inAdmin || user?.role === 'SuperAdmin' || user?.role === 'admin' || user?.role === 'superadmin') {
    backHref = '/admin'
    backLabel = 'Back to admin dashboard'
  } else if (inFarmer || user?.role === 'farmer') {
    backHref = '/farmer'
    backLabel = 'Back to farmer dashboard'
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="tabular text-sm font-medium text-muted-foreground">404</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          The page you're looking for doesn't exist or may have moved. Let's get you back on track.
        </p>
      </div>
      <Button render={<Link href={backHref} />}>
        <ArrowLeft data-icon="inline-start" />
        {backLabel}
      </Button>
    </div>
  )
}
