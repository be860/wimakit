"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sprout, LayoutDashboard, Search, MessageSquare, LogOut, ShoppingBag } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function BuyerNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navItems = [
    { href: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/buyer/browse", label: "Browse Produce", icon: Search },
    { href: "/buyer/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/buyer/messages", label: "Messages", icon: MessageSquare },
  ]

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/buyer/dashboard" className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">WiMakit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user?.name}</span> (Buyer)
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
