import type React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <main className="flex flex-1 justify-center px-4 py-6 sm:items-center sm:py-10">
        <div className="flex w-full max-w-[440px] flex-col gap-4">{children}</div>
      </main>

      <footer className="flex flex-col items-center gap-1 px-4 py-6 text-center">
        <p className="text-[11px] text-muted-foreground">
          Contact information is never shared outside the platform.
        </p>
        <p className="text-[11px] text-muted-foreground">
          © 2026 WiMakit. Real environment — live data only.
        </p>
      </footer>
    </div>
  )
}
