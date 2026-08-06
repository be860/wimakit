"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Sprout, LayoutDashboard, Package, MessageSquare, LogOut, DollarSign, ChevronLeft, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const EXPANDED_WIDTH = "16rem" // w-64
const COLLAPSED_WIDTH = "5rem" // w-20

export function FarmerNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("wimakit_farmer_sidebar_collapsed") === "true"
    setIsCollapsed(saved)
    // Delay marking as "mounted" one tick so the very first paint after
    // reading localStorage doesn't animate — it should just appear in its
    // correct state, not visibly snap into it.
    requestAnimationFrame(() => setMounted(true))
  }, [])

  useEffect(() => {
  document.documentElement.style.setProperty(
    "--wimakit-farmer-sidebar-width",
    isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
  )
}, [isCollapsed])

  const toggleSidebar = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem("wimakit_farmer_sidebar_collapsed", String(nextState))
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navItems = [
    { href: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/farmer/produce", label: "My Produce", icon: Package },
    { href: "/farmer/sales", label: "Sales History", icon: DollarSign },
    { href: "/farmer/messages", label: "Messages", icon: MessageSquare },
  ]

  const sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
  const transitionClass = mounted
    ? "transition-[width] duration-300 ease-in-out motion-reduce:transition-none"
    : ""

  return (
    <>
      {/* ── LAYOUT SPACER ──────────────────────────────────────────────────
          Sits in normal document flow (not fixed), so the page content that
          follows this component in the DOM pushes/pulls in exact sync with
          the visual sidebar below. This replaces any external margin-left
          wiring you may have had tied to a body data-attribute — remove
          that if it still exists elsewhere, or you'll get double spacing. */}
      <div
        className={`hidden md:block flex-shrink-0 ${transitionClass}`}
        style={{ width: sidebarWidth }}
        aria-hidden="true"
      />

      {/* ── DESKTOP COLLAPSIBLE SIDEBAR ────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-40 border-r border-[#DDD3C0] ${transitionClass}`}
        style={{ width: sidebarWidth, background: "#F7F2E9", color: "#2B2420" }}
      >
        {/* Header & Logo */}
        <div className="flex items-center justify-between border-b border-[#DDD3C0] h-16 px-4 flex-shrink-0">
          <Link href="/farmer/dashboard" className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#1B4B3A" }}
            >
              <Sprout className="h-6 w-6" style={{ color: "#F7F2E9" }} />
            </div>
            <span
              className={`font-display text-xl font-bold tracking-[-0.02em] whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
              }`}
              style={{ color: "#1B4B3A" }}
            >
              WiMakit
            </span>
          </Link>

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-[#EAE4D7] text-[#5C524B] transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4B3A] focus-visible:ring-offset-2"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
            aria-expanded={!isCollapsed}
          >
            <ChevronLeft
              className={`h-5 w-5 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-[#DDD3C0] overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#EAE4D7" }}
            >
              <User className="h-5 w-5" style={{ color: "#1B4B3A" }} />
            </div>
            <div
              className={`min-w-0 flex-1 overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
              }`}
            >
              <p className="text-sm font-bold truncate whitespace-nowrap" style={{ color: "#2B2420" }}>
                {user?.fullName || "Farmer"}
              </p>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded inline-block whitespace-nowrap"
                style={{ background: "#1B4B3A", color: "#F7F2E9" }}
              >
                FARMER
              </span>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4B3A] focus-visible:ring-offset-2"
                style={{
                  background: isActive ? "#1B4B3A" : "transparent",
                  color: isActive ? "#F7F2E9" : "#5C524B",
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`truncate whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
                    isCollapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Logout at Bottom */}
        <div className="p-3 border-t border-[#DDD3C0] flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-colors hover:bg-[#B34A2E]/10 hover:text-[#B34A2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34A2E] focus-visible:ring-offset-2"
            style={{ color: "#5C524B" }}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100"
              }`}
            >
              Log Out
            </span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP HEADER BAR ───────────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-40 h-14 px-4 flex items-center justify-between border-b border-[#DDD3C0]"
        style={{ background: "#F7F2E9", color: "#2B2420" }}
      >
        <Link href="/farmer/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1B4B3A" }}>
            <Sprout className="h-5 w-5" style={{ color: "#F7F2E9" }} />
          </div>
          <span className="font-display text-lg font-bold tracking-[-0.02em]" style={{ color: "#1B4B3A" }}>
            WiMakit
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold max-w-[120px] truncate" style={{ color: "#2B2420" }}>
            {user?.fullName}
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-[#EAE4D7] text-[#B34A2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34A2E]"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-[#DDD3C0] md:hidden shadow-lg"
        style={{ background: "rgba(247, 242, 233, 0.95)", backdropFilter: "blur(8px)" }}
      >
        <div className="grid grid-cols-4 h-full max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex flex-col items-center justify-center px-1 transition-colors"
                style={{ color: isActive ? "#1B4B3A" : "#5C524B" }}
              >
                <Icon className={`h-5 w-5 mb-1 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span className={`text-[10px] truncate max-w-[68px] ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}