'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  MessageSquare,
  MoreHorizontal,
  BarChart3,
  Star,
  Bell,
  Settings,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

const primary = [
  { href: '/farmer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/farmer/products', label: 'Products', icon: Package },
  { href: '/farmer/orders', label: 'Orders', icon: ClipboardList },
  { href: '/farmer/messages', label: 'Messages', icon: MessageSquare },
]

const overflow = [
  { href: '/farmer/analytics', label: 'Sales & Analytics', icon: BarChart3 },
  { href: '/farmer/reviews', label: 'Reviews', icon: Star },
  { href: '/farmer/notifications', label: 'Notifications', icon: Bell },
  { href: '/farmer/settings', label: 'Settings', icon: Settings },
]

function active(pathname: string, href: string) {
  if (href === '/farmer') return pathname === '/farmer'
  return pathname.startsWith(href)
}

export function FarmerBottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = React.useState(false)

  const moreActive = overflow.some((i) => active(pathname, i.href))

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-background md:hidden"
      >
        {primary.map((item) => {
          const Icon = item.icon
          const isActive = active(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                isActive ? 'text-farmer' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium',
            moreActive ? 'text-farmer' : 'text-muted-foreground',
          )}
        >
          <MoreHorizontal className="size-5" />
          More
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle className="font-display text-base">More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 p-4 pt-0">
            {overflow.map((item) => {
              const Icon = item.icon
              const isActive = active(pathname, item.href)
              return (
                <SheetClose
                  key={item.href}
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md border border-border p-3 text-sm',
                        isActive
                          ? 'bg-farmer/10 font-medium text-farmer'
                          : 'bg-card text-foreground',
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  }
                />
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
