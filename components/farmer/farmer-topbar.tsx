'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Search, Settings, UserCog, X } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { farmerApi, type FarmerNotification } from '@/lib/farmer/api'
import { cn } from '@/lib/utils'
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

const notifDot: Record<string, string> = {
  order: 'bg-farmer',
  product: 'bg-gold',
  message: 'bg-buyer',
  broadcast: 'bg-primary',
}

export function FarmerTopbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<FarmerNotification[]>([])

  React.useEffect(() => {
    farmerApi
      .getNotifications()
      .then((data) => setNotifications(data || []))
      .catch(() => setNotifications([]))
  }, [])

  const unread = notifications.filter((n) => n.isUnread).length
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'FM'

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm lg:px-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="flex size-7 items-center justify-center rounded-md bg-farmer text-[11px] font-semibold text-background">
          WM
        </span>
        <span className="font-display text-sm">WiMakit</span>
      </div>

      {/* Desktop search */}
      <div className="hidden w-full max-w-md md:block">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search products, orders, buyers…"
            aria-label="Global search"
          />
        </InputGroup>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Mobile search trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={`Notifications, ${unread} unread`}
              >
                <Bell />
                {unread > 0 && (
                  <span className="tabular absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-farmer text-[10px] font-semibold text-background">
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
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 4).map((n) => (
                  <DropdownMenuItem key={n.id} className="items-start gap-2.5 py-2">
                    <span
                      aria-hidden
                      className={cn(
                        'mt-1.5 size-1.5 shrink-0 rounded-full',
                        n.isUnread ? notifDot[n.type] || 'bg-farmer' : 'bg-border',
                      )}
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{n.title}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/farmer/notifications" />}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 pr-2 pl-1.5">
                <Avatar className="size-6.5">
                  <AvatarFallback className="bg-farmer text-[11px] text-background">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.fullName || 'Farmer User'}
                </span>
                <ChevronDown className="text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-sm font-medium">{user?.fullName || 'Farmer'}</span>
              <span className="text-xs text-muted-foreground">
                {user?.email || ''}
              </span>
              <Badge
                variant="outline"
                className="mt-1 w-fit border-farmer/30 bg-farmer/10 text-farmer"
              >
                Farmer
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<a href="/farmer/settings" />}>
                <UserCog />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<a href="/farmer/settings" />}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout()
                router.push('/sign-in')
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile full-screen search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
          <div className="flex h-14 items-center gap-2 border-b border-border px-4">
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus
                type="search"
                placeholder="Search products, orders, buyers…"
                aria-label="Search"
              />
            </InputGroup>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <X />
            </Button>
          </div>
          <p className="p-4 text-sm text-muted-foreground">
            Start typing to search your products, orders and buyers.
          </p>
        </div>
      )}
    </header>
  )
}

