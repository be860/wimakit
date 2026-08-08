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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import { adminApi } from '@/lib/admin/api'
import { useAuth } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
}) {
  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex h-9 items-center gap-2.5 rounded-md border border-transparent px-2.5 text-sm transition-colors',
        collapsed && 'justify-center px-0',
        active
          ? 'border-border bg-card font-medium text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge ? (
        <span className="tabular ml-auto rounded-sm bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {item.badge}
        </span>
      ) : null}
      {collapsed && item.badge ? (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive"
        />
      ) : null}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">
        {item.label}
        {item.badge ? ` · ${item.badge}` : ''}
      </TooltipContent>
    </Tooltip>
  )
}

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const [counts, setCounts] = React.useState<{
    farmers?: number
    products?: number
    fraudCases?: number
  }>({})

  React.useEffect(() => {
    adminApi.getMetrics()
      .then((m) =>
        setCounts({
          farmers: m.totalFarmers,
          products: m.activeProductListings,
          fraudCases: m.openFraudCases,
        }),
      )
      .catch(() => {})
  }, [])

  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'superadmin'

  const primaryNav: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/farmers', label: 'Farmers', icon: Sprout, badge: counts.farmers },
    { href: '/admin/buyers', label: 'Buyers', icon: Store },
    { href: '/admin/products', label: 'Products', icon: PackageSearch, badge: counts.products },
    { href: '/admin/fraud-cases', label: 'Fraud Cases', icon: ShieldAlert, badge: counts.fraudCases },
  ]

  const secondaryNav: NavItem[] = [
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    ...(isSuperAdmin ? [{ href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText }] : []),
    { href: '/admin/notifications', label: 'Broadcast', icon: Megaphone },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'w-[60px]' : 'w-[228px]',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3',
          collapsed && 'justify-center px-0',
        )}
      >
        <img
          src="/wimakit-icon.png"
          alt="WiMakit"
          className="size-7 shrink-0 object-contain"
        />
        {!collapsed && (
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-display truncate text-sm">WiMakit</span>
            <span className="truncate text-[11px] text-muted-foreground">
              SuperAdmin
            </span>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-0.5">
          {!collapsed && (
            <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Oversight
            </p>
          )}
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-0.5">
          {!collapsed && (
            <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Platform
            </p>
          )}
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <PanelLeftClose className="size-4 shrink-0" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
