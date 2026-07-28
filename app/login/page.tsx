"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleLogin } from "@react-oauth/google"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, loginWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address or phone number.")
      return
    }
    if (!password) {
      setError("Please enter your password.")
      return
    }

    setIsLoading(true)

    try {
      const success = await login(email.trim(), password)
      if (success) {
        const storedUser = localStorage.getItem("wimakit_user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          if (user.role === "farmer") {
            router.push("/farmer/dashboard")
          } else {
            router.push("/buyer/dashboard")
          }
        }
      } else {
        setError("Invalid email or password. Please check your credentials.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return
    setIsLoading(true)
    setError("")

    try {
      const ok = await loginWithGoogle(credentialResponse.credential)
      if (ok) {
        const storedUser = localStorage.getItem("wimakit_user")
        const parsed = storedUser ? JSON.parse(storedUser) : null
        if (parsed?.role === "farmer") {
          router.push("/farmer/dashboard")
        } else {
          router.push("/buyer/dashboard")
        }
      } else {
        setError("Google authentication failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Google authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const labelClass = "text-xs font-semibold"
  const labelStyle = { color: '#5C524B' }

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: '#F7F2E9', color: '#2B2420' }}>
      {/* Back link */}
      <div className="px-5 pt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: '#5C524B' }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{ background: '#1B4B3A' }}>
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#F7F2E9" strokeWidth="2" strokeLinecap="round">
                <path d="M12 22V8" />
                <path d="M8 12 Q10 8 12 8" />
                <path d="M16 12 Q14 8 12 8" />
                <path d="M6 16 Q9 12 12 12" />
                <path d="M18 16 Q15 12 12 12" />
                <circle cx="12" cy="5" r="2" fill="#E8A33D" stroke="none" />
              </svg>
            </div>
            <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] leading-[1.1]" style={{ color: '#2B2420' }}>
              Welcome back
            </h1>
            <p className="text-sm mt-1.5" style={{ color: '#5C524B' }}>
              Log in to your WiMakit marketplace account
            </p>
          </div>

          {/* Form card */}
          <div className="relative overflow-hidden rounded-2xl border-2 p-6" style={{ borderColor: '#DDD3C0', background: 'rgba(255,255,255,0.6)' }}>
            {/* Faint Gara bleed motif */}
            <div
              className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full opacity-10 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 40% 45%, #1E3A5F 0%, #1E3A5F88 40%, transparent 70%)',
                filter: 'url(#gara-bleed)',
              }}
            />

            {/* Google Login Section */}
            <div className="relative z-10 mb-6 pb-6 border-b flex flex-col items-center gap-3" style={{ borderColor: '#DDD3C0' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign In failed")}
                useOneTap
                theme="outline"
                shape="pill"
                text="signin_with"
              />
            </div>

            <div className="relative z-10 mb-6 text-center">
              <span className="bg-[#F7F2E9] px-3 text-xs font-semibold relative z-10" style={{ color: '#5C524B' }}>
                Or with email / phone
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#DDD3C0' }} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl border-[#B34A2E]/30 bg-[#B34A2E]/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-semibold" style={{ color: '#B34A2E' }}>{error}</AlertDescription>
                </Alert>
              )}

              {/* Phone or Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass} style={labelStyle}>
                  Phone number or email address
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="e.g. 076 123 456 or name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[52px] rounded-xl border-2 text-base font-medium"
                  style={{ borderColor: '#DDD3C0', background: '#F7F2E9', color: '#2B2420' }}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className={labelClass} style={labelStyle}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[52px] rounded-xl border-2 text-base font-medium"
                  style={{ borderColor: '#DDD3C0', background: '#F7F2E9', color: '#2B2420' }}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-opacity active:scale-[0.99] disabled:opacity-60"
                style={{ background: '#1B4B3A', color: '#F7F2E9' }}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-[#F7F2E9]/30 border-t-[#F7F2E9] animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </form>

            {/* Krio register microcopy link */}
            <div className="relative z-10 mt-6 pt-5 border-t text-center" style={{ borderColor: '#DDD3C0' }}>
              <p className="text-sm" style={{ color: '#5C524B' }}>
                <span className="italic opacity-80">No get akant? </span>
                <Link href="/register" className="font-bold underline ml-1" style={{ color: '#1E3A5F' }}>
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-xs" style={{ color: '#5C524B', opacity: 0.6 }}>
        <p>&copy; {new Date().getFullYear()} WiMakit. Sierra Leone.</p>
      </footer>
    </div>
  )
}
