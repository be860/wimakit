"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import type { ReactNode } from "react"

// Must match backend Google:ClientId in appsettings.json
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "431428932658-7h1v2iing1athlf723488650gp0vdvj8.apps.googleusercontent.com"

export function GoogleProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  )
}
