'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Star,
  Bell,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { farmerApi } from '@/lib/farmer/api'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type FarmerNavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export function isFarmerActive(pathname: string, href: string) {
  if (href === '/farmer') return pathname === '/farmer'
  return pathname.startsWith(href)
}

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: FarmerNavItem
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
          'absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-farmer transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Icon className={cn('size-4 shrink-0', active && 'text-farmer')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge ? (
        <span className="tabular ml-auto rounded-sm bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {item.badge}
        </span>
      ) : null}
      {collapsed && item.badge ? (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-farmer"
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

export function FarmerSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [counts, setCounts] = React.useState<{
    products?: number
    orders?: number
    messages?: number
    notifications?: number
  }>({})

  React.useEffect(() => {
    if (user?.id) {
      farmerApi.getFarmerProduce(user.id)
        .then((p) => setCounts((c) => ({ ...c, products: p?.length || 0 })))
        .catch(() => {})
    }
    farmerApi.getFarmerSales()
      .then((s) => setCounts((c) => ({ ...c, orders: s?.filter((o) => o.status === 'Pending').length || 0 })))
      .catch(() => {})
    farmerApi.getConversations()
      .then((convs) => setCounts((c) => ({ ...c, messages: convs?.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0) || 0 })))
      .catch(() => {})
    farmerApi.getNotifications()
      .then((n) => setCounts((c) => ({ ...c, notifications: n?.filter((item) => item.isUnread).length || 0 })))
      .catch(() => {})
  }, [user?.id])

  const farmerPrimaryNav: FarmerNavItem[] = [
    { href: '/farmer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/farmer/products', label: 'My Products', icon: Package, badge: counts.products },
    { href: '/farmer/orders', label: 'Orders', icon: ClipboardList, badge: counts.orders },
    { href: '/farmer/messages', label: 'Messages', icon: MessageSquare, badge: counts.messages },
  ]

  const farmerSecondaryNav: FarmerNavItem[] = [
    { href: '/farmer/analytics', label: 'Sales & Analytics', icon: BarChart3 },
    { href: '/farmer/reviews', label: 'Reviews', icon: Star },
    { href: '/farmer/notifications', label: 'Notifications', icon: Bell, badge: counts.notifications },
    { href: '/farmer/settings', label: 'Settings', icon: Settings },
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
              Farmer Portal
            </span>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-0.5">
          {!collapsed && (
            <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Selling
            </p>
          )}
          {farmerPrimaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={isFarmerActive(pathname, item.href)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-0.5">
          {!collapsed && (
            <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Insights
            </p>
          )}
          {farmerSecondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={isFarmerActive(pathname, item.href)}
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
