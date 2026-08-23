'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Fixed bottom action bar shown only on small screens, once the hero's
 * primary CTA has scrolled out of view — so mobile visitors always have a
 * one-thumb way to register without hunting back up to the nav.
 */
export function MobileStickyCta({ watchId }: { watchId: string }) {
  const [show, setShow] = useState(false)
  const sentinelSeen = useRef(false)

  useEffect(() => {
    const target = document.getElementById(watchId)
    if (!target || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        sentinelSeen.current = true
        setShow(!entry.isIntersecting)
      },
      { threshold: 0 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [watchId])

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex items-center gap-2.5 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm transition-transform duration-300 ease-out sm:hidden',
        'pb-[calc(0.75rem+env(safe-area-inset-bottom))]',
        show ? 'translate-y-0' : 'translate-y-full',
      )}
      aria-hidden={!show}
    >
      <Button
        variant="outline"
        className="h-11 flex-1 rounded-lg text-[14px]"
        render={<Link href="/sign-in" tabIndex={show ? 0 : -1} />}
      >
        Sign in
      </Button>
      <Button
        className="h-11 flex-[1.4] gap-1.5 rounded-lg bg-farmer text-[14px] text-background hover:bg-farmer/90"
        render={<Link href="/sign-up" tabIndex={show ? 0 : -1} />}
      >
        Register as a Farmer
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
