import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { GoogleProvider } from "@/components/google-provider"

export const metadata: Metadata = {
  title: "WiMakit - Farmer Marketplace",
  description:
    "Connecting local farmers in Sierra Leone with buyers. Fresh produce directly from the source.",
  generator: "Next.js",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased">
        {/* Hidden SVG filter for Gara Bleed organic motif */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <filter id="gara-bleed">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <GoogleProvider>
          <AuthProvider>{children}</AuthProvider>
        </GoogleProvider>
        <Analytics />
      </body>
    </html>
  )
}
