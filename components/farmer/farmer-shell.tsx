'use client'

import * as React from 'react'

import { FarmerSidebar } from '@/components/farmer/farmer-sidebar'
import { FarmerTopbar } from '@/components/farmer/farmer-topbar'
import { FarmerBottomNav } from '@/components/farmer/farmer-bottom-nav'

export function FarmerShell({ children }: { children: React.ReactNode }) {
  // Tablet (768–1023px) defaults to the collapsed icon-rail; desktop expands.
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const apply = () => setCollapsed(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return (
    <div className="flex min-h-svh bg-background">
      <FarmerSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <FarmerTopbar />
        <main className="flex-1 px-4 py-5 pb-24 lg:px-6 lg:py-6 md:pb-6">
          {children}
        </main>
      </div>

      <FarmerBottomNav />
    </div>
  )
}
