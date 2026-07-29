"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function VerifyEmailContent() {
  const router = useRouter()
  const { setSession } = useAuth()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [resendMessage, setResendMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Auto-populate email from URL parameter or localStorage
  useEffect(() => {
    const urlEmail = searchParams.get("email")
    if (urlEmail) {
      setEmail(urlEmail)
    } else {
      const storedUser = localStorage.getItem("wimakit_user")
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          if (parsed.email) setEmail(parsed.email)
        } catch (e) {
          // ignore error
        }
      }
    }
  }, [searchParams])

  // Countdown timer for Resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setStatus("error")
      setMessage("Please enter your email address.")
      return
    }
    if (otp.length < 6) {
      setStatus("error")
      setMessage("Please enter the complete 6-digit OTP code.")
      return
    }

    setIsLoading(true)
    setStatus("verifying")
    setMessage("")
    setResendMessage("")

    try {
      const response = await authAPI.verifyOtp(
  email.trim(),
  otp.trim()
)

// Save access token, refresh token and user
setSession(response)

setStatus("success")
setMessage("Your email has been verified successfully!")

// Redirect after a short delay
setTimeout(() => {
  router.push("/")
}, 1500)
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Verification failed. The OTP code may be invalid or expired.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setStatus("error")
      setMessage("Please enter your email address to receive a new OTP.")
      return
    }
    if (cooldown > 0) return

    setIsResending(true)
    setResendMessage("")
    setMessage("")

    try {
      const response = await authAPI.requestOtp(email.trim())
      setResendMessage(response.message || "A new 6-digit OTP code has been sent to your email.")
      setCooldown(60) // 60-second cooldown
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const labelClass = "text-xs font-semibold"
  const labelStyle = { color: "#5C524B" }
  const inputClass = "h-[52px] rounded-xl border-2 text-base font-medium"
  const inputStyle = { borderColor: "#DDD3C0", background: "#F7F2E9", color: "#2B2420" }

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Top Header Card */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
          style={{ background: status === "success" ? "#1B4B3A" : "#1E3A5F" }}
        >
          {status === "success" ? (
            <CheckCircle2 className="w-8 h-8" style={{ color: "#F7F2E9" }} />
          ) : (
            <Mail className="w-8 h-8" style={{ color: "#F7F2E9" }} />
          )}
        </div>
        <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] leading-[1.1]" style={{ color: "#2B2420" }}>
          {status === "success" ? "Email Verified!" : "Verify Your Account"}
        </h1>
        <p className="text-sm mt-2" style={{ color: "#5C524B" }}>
          {status === "success"
            ? "Your account is verified and ready to use."
            : "Enter the 6-digit OTP code sent to your email address."}
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border-2 p-6" style={{ borderColor: "#DDD3C0", background: "rgba(255,255,255,0.6)" }}>
        {status === "error" && message && (
          <Alert variant="destructive" className="rounded-xl border-[#B34A2E]/30 bg-[#B34A2E]/5 mb-5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold" style={{ color: "#B34A2E" }}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {resendMessage && (
          <Alert className="rounded-xl border-[#1B4B3A]/20 bg-[#1B4B3A]/5 mb-5">
            <CheckCircle2 className="h-4 w-4" style={{ color: "#1B4B3A" }} />
            <AlertDescription className="text-xs font-semibold" style={{ color: "#1B4B3A" }}>
              {resendMessage}
            </AlertDescription>
          </Alert>
        )}

        {status === "success" ? (
          <div className="space-y-4">
            <Alert className="rounded-xl border-[#1B4B3A]/20 bg-[#1B4B3A]/5">
  <CheckCircle2 className="h-4 w-4" style={{ color: "#1B4B3A" }} />
  <AlertDescription
    className="text-xs font-semibold"
    style={{ color: "#1B4B3A" }}
  >
    {message}
  </AlertDescription>
</Alert>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className={labelClass} style={labelStyle}>
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
                required
                disabled={isLoading}
              />
            </div>

            {/* 6-Digit OTP Code */}
            <div className="space-y-2">
              <Label htmlFor="otp" className={labelClass} style={labelStyle}>
                6-digit OTP code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-[60px] rounded-xl border-2 text-center text-3xl font-mono tracking-[0.4em] font-bold"
                style={inputStyle}
                required
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            {/* Submit Verification Button (Palm Oil Gold #E8A33D) */}
            <button
              type="submit"
              disabled={isLoading || otp.length < 6 || !email.trim()}
              className="w-full h-[52px] rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-opacity active:scale-[0.99] disabled:opacity-60"
              style={{ background: "#E8A33D", color: "#2B2420" }}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-[#2B2420]/30 border-t-[#2B2420] animate-spin" />
                  <span>Verifying OTP…</span>
                </>
              ) : (
                <span>Verify OTP</span>
              )}
            </button>

            {/* Resend OTP Option */}
            <div className="pt-4 border-t text-center space-y-2" style={{ borderColor: "#DDD3C0" }}>
              <p className="text-xs" style={{ color: "#5C524B" }}>
                Didn't receive the code or link expired?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || cooldown > 0 || !email.trim()}
                className="inline-flex items-center gap-1.5 text-sm font-bold transition-opacity disabled:opacity-50"
                style={{ color: "#1E3A5F" }}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
                <span>
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend OTP Code"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
