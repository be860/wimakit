import type React from 'react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center px-4 lg:px-6">
        <Link href="/sign-in" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-farmer text-[11px] font-semibold text-background">
            WM
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-sm">WiMakit</span>
            <span className="text-[11px] text-muted-foreground">
              Sierra Leone Agricultural Marketplace
            </span>
          </span>
        </Link>
      </header>

      <main className="flex flex-1 justify-center px-4 py-6 sm:items-center sm:py-10">
        <div className="flex w-full max-w-[440px] flex-col gap-4">{children}</div>
      </main>

      <footer className="flex flex-col items-center gap-1 px-4 py-6 text-center">
        <p className="text-[11px] text-muted-foreground">
          Contact information is never shared outside the platform.
        </p>
        <p className="text-[11px] text-muted-foreground">
          © 2026 WiMakit. Demo environment — mock data only.
        </p>
      </footer>
    </div>
  )
}
