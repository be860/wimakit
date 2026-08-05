'use client'

import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserCog } from 'lucide-react'

import { notifications } from '@/lib/admin/mock-data'
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

const unread = notifications.filter((n) => n.unread).length

export function AdminTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
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
              {notifications.slice(0, 4).map((n) => (
                <DropdownMenuItem key={n.id} className="items-start gap-2.5 py-2">
                  <span
                    aria-hidden
                    className={
                      n.unread
                        ? 'mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive'
                        : 'mt-1.5 size-1.5 shrink-0 rounded-full bg-border'
                    }
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">{n.title}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {n.body}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{n.at}</span>
                  </span>
                </DropdownMenuItem>
              ))}
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
                  <AvatarFallback className="text-[11px]">KS</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">Kadiatu Sowe</span>
                <ChevronDown className="text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-sm font-medium">Kadiatu Sowe</span>
              <span className="text-xs text-muted-foreground">
                kadiatu.sowe@wimakit.sl
              </span>
              <Badge variant="outline" className="mt-1 w-fit">
                SuperAdmin
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
            <DropdownMenuItem variant="destructive">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
