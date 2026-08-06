import type { ReactNode } from "react"
import { FarmerNav } from "@/components/farmer-nav"

export default function FarmerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#F7F2E9", color: "#2B2420" }}>
      <FarmerNav />
      <main
        className="min-h-screen transition-[margin-left] duration-300 ease-in-out motion-reduce:transition-none md:ml-[var(--wimakit-farmer-sidebar-width,16rem)] px-4 md:px-8 py-8 pb-24 md:pb-8"
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}