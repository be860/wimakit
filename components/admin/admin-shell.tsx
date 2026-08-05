'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Sprout,
  Store,
  PackageSearch,
  ShieldAlert,
  Tags,
  ScrollText,
  Megaphone,
  Settings,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const mobileNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/farmers', label: 'Farmers', icon: Sprout },
  { href: '/admin/buyers', label: 'Buyers', icon: Store },
  { href: '/admin/products', label: 'Products', icon: PackageSearch },
  { href: '/admin/fraud-cases', label: 'Fraud Cases', icon: ShieldAlert },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
  { href: '/admin/notifications', label: 'Broadcast', icon: Megaphone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/control/login')
      } else if (user.role !== 'SuperAdmin' && user.role !== 'admin' && user.role !== 'superadmin') {
        router.push('/control/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex min-h-svh bg-background">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetHeader className="border-b border-sidebar-border">
            <SheetTitle className="flex items-center gap-2.5 text-sm">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
                WM
              </span>
              WiMakit SuperAdmin
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-0.5 p-2">
            {mobileNav.map((item) => {
              const Icon = item.icon
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors',
                    active
                      ? 'bg-card font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-5 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  )
}
