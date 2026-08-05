'use client'

import * as React from 'react'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserCog } from 'lucide-react'

import { adminApi, NotificationItem } from '@/lib/admin/api'
import { useAuth } from '@/components/providers/auth-provider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase()
}

export function AdminTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])

  React.useEffect(() => {
    adminApi.getNotifications()
      .then(setNotifications)
      .catch(() => {})
  }, [])

  const unread = notifications.filter((n) => n.isUnread).length
  const displayName = user?.fullName ?? user?.firstName ?? 'Admin'
  const email = user?.email ?? ''
  const role = user?.role ?? 'SuperAdmin'

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <div className="w-full max-w-md">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search farmers, buyers, orders, cases…"
            aria-label="Global search"
          />
        </InputGroup>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`}>
                <Bell />
                {unread > 0 && (
                  <span className="tabular absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary">{unread} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {notifications.length === 0 ? (
                <DropdownMenuItem className="text-muted-foreground">
                  No notifications
                </DropdownMenuItem>
              ) : (
                notifications.slice(0, 4).map((n) => (
                  <DropdownMenuItem key={n.id} className="items-start gap-2.5 py-2">
                    <span
                      aria-hidden
                      className={
                        n.isUnread
                          ? 'mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive'
                          : 'mt-1.5 size-1.5 shrink-0 rounded-full bg-border'
                      }
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{n.title}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/admin/notifications" />}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 pr-2 pl-1.5">
                <Avatar className="size-6.5">
                  <AvatarFallback className="text-[11px]">{initials(displayName)}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
                <ChevronDown className="text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
              <Badge variant="outline" className="mt-1 w-fit">
                {role}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCog />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<a href="/admin/settings" />}>
                <Settings />
                System settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
