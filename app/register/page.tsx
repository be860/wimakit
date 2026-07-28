"use client"

import type React from "react"
import { authAPI, setAuthToken } from "@/lib/api"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UserRole } from "@/lib/types"
import { GoogleLogin } from "@react-oauth/google"
import { useAuth } from "@/lib/auth-context"

const VILLAGES = ["Waterloo", "Songo", "Tombo", "Newton", "Grafton", "Jui", "Kent"]

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loginWithGoogle } = useAuth()
  const [role, setRole] = useState<UserRole>("buyer")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    farmSize: "",
    farmingExperience: "",
    businessName: "",
    businessType: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "farmer" || roleParam === "buyer") {
      setRole(roleParam)
    }
  }, [searchParams])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filteredVillages = VILLAGES.filter((v) =>
    v.toLowerCase().includes(formData.location.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Frontend validation
    const nameRegex = /^[a-zA-Z\s'-]+$/
    if (!formData.firstName.trim() || !nameRegex.test(formData.firstName)) {
      setError("First name must contain only letters, spaces, or hyphens.")
      return
    }
    if (!formData.lastName.trim() || !nameRegex.test(formData.lastName)) {
      setError("Last name must contain only letters, spaces, or hyphens.")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role,
        phone: formData.phone.trim() || undefined,
        location: formData.location.trim() || undefined,
        farmSize: role === "farmer" ? formData.farmSize.trim() : undefined,
        farmingExperience: role === "farmer" ? formData.farmingExperience.trim() : undefined,
        businessName: role === "buyer" ? formData.businessName.trim() : undefined,
        businessType: role === "buyer" ? formData.businessType : undefined,
      })

      setAuthToken(response.token)
      localStorage.setItem("wimakit_user", JSON.stringify(response.user))
      setSuccess(true)
      setError("")

      // Redirect to verify-email with email param after a short delay
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`)
      }, 1500)
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
      const ok = await loginWithGoogle(credentialResponse.credential, role)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const isFarmer = role === "farmer"
  const inputClass = "h-[52px] rounded-xl border-2 text-base font-medium"
  const inputStyle = { borderColor: '#DDD3C0', background: '#F7F2E9', color: '#2B2420' }
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

      <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-12">
        <div className="w-full max-w-lg animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-[32px] font-bold tracking-[-0.02em] leading-[1.1]" style={{ color: '#2B2420' }}>
              Create your account
            </h1>
            <p className="text-sm mt-2" style={{ color: '#5C524B' }}>
              Join WiMakit — Western Area Rural District
            </p>
          </div>

          {/* Role selector */}
          <div className="space-y-2 mb-6">
            <span className={labelClass} style={labelStyle}>I am a:</span>
            <div className="grid grid-cols-2 gap-3">
              {/* Farmer Card */}
              <button
                type="button"
                onClick={() => setRole("farmer")}
                className="relative overflow-hidden rounded-2xl p-5 text-left transition-all active:scale-[0.98] min-h-[110px] flex flex-col justify-between"
                style={{
                  background: isFarmer ? '#1B4B3A' : 'rgba(255,255,255,0.4)',
                  border: `2px solid ${isFarmer ? '#1B4B3A' : '#DDD3C0'}`,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: isFarmer ? 'rgba(247,242,233,0.15)' : '#EAE4D7' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" strokeWidth="2" strokeLinecap="round"
                    stroke={isFarmer ? '#F7F2E9' : '#2B2420'}>
                    <path d="M12 22V8" />
                    <path d="M8 12 Q10 8 12 8" />
                    <path d="M16 12 Q14 8 12 8" />
                    <path d="M6 16 Q9 12 12 12" />
                    <path d="M18 16 Q15 12 12 12" />
                    <circle cx="12" cy="5" r="2" fill={isFarmer ? '#E8A33D' : '#B34A2E'} stroke="none" />
                  </svg>
                </div>
                <span className="font-display text-base font-bold tracking-[-0.02em]" style={{ color: isFarmer ? '#F7F2E9' : '#2B2420' }}>
                  I'm a Farmer
                </span>
              </button>

              {/* Buyer Card */}
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className="relative overflow-hidden rounded-2xl p-5 text-left transition-all active:scale-[0.98] min-h-[110px] flex flex-col justify-between"
                style={{
                  background: !isFarmer ? '#1E3A5F' : 'rgba(255,255,255,0.4)',
                  border: `2px solid ${!isFarmer ? '#1E3A5F' : '#DDD3C0'}`,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: !isFarmer ? 'rgba(247,242,233,0.15)' : '#EAE4D7' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" strokeWidth="2" strokeLinecap="round"
                    stroke={!isFarmer ? '#F7F2E9' : '#2B2420'}>
                    <path d="M4 10 L6 20 H18 L20 10" />
                    <path d="M2 10 H22" />
                    <path d="M8 10 V6 Q12 2 16 6 V10" />
                  </svg>
                </div>
                <span className="font-display text-base font-bold tracking-[-0.02em]" style={{ color: !isFarmer ? '#F7F2E9' : '#2B2420' }}>
                  I'm a Buyer
                </span>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border-2 p-6" style={{ borderColor: '#DDD3C0', background: 'rgba(255,255,255,0.6)' }}>
            
            {/* Google Sign In Option */}
            <div className="mb-6 pb-6 border-b flex flex-col items-center gap-3" style={{ borderColor: '#DDD3C0' }}>
              <span className={labelClass} style={labelStyle}>Fast registration with Google</span>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign Up failed")}
                useOneTap
                theme="outline"
                shape="pill"
                text="signup_with"
              />
            </div>

            <div className="relative mb-6 text-center">
              <span className="bg-[#F7F2E9] px-3 text-xs font-semibold relative z-10" style={{ color: '#5C524B' }}>
                Or fill in your details
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#DDD3C0' }} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl border-[#B34A2E]/30 bg-[#B34A2E]/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-semibold" style={{ color: '#B34A2E' }}>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="rounded-xl border-[#1B4B3A]/20 bg-[#1B4B3A]/5">
                  <CheckCircle2 className="h-4 w-4" style={{ color: '#1B4B3A' }} />
                  <AlertDescription className="text-xs font-semibold" style={{ color: '#1B4B3A' }}>
                    Account created! Check your email to verify your account.
                  </AlertDescription>
                </Alert>
              )}

              {/* First Name + Last Name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={labelClass} style={labelStyle}>First name</Label>
                  <Input id="firstName" placeholder="Aminata" value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={inputClass} style={inputStyle} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className={labelClass} style={labelStyle}>Last name</Label>
                  <Input id="lastName" placeholder="Kamara" value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={inputClass} style={inputStyle} required />
                </div>
              </div>

              {/* Phone + District / Village */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className={labelClass} style={labelStyle}>Phone number</Label>
                  <Input id="phone" type="tel" placeholder="076 XXX XXX" value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={inputClass} style={inputStyle} required />
                </div>

                <div className="space-y-2" ref={locationRef}>
                  <Label htmlFor="location" className={labelClass} style={labelStyle}>District / Village</Label>
                  <div className="relative">
                    <Input
                      id="location"
                      placeholder="Waterloo, Songo, Tombo..."
                      value={formData.location}
                      onChange={(e) => {
                        handleInputChange("location", e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className={inputClass}
                      style={inputStyle}
                      required
                      autoComplete="off"
                    />
                    {showSuggestions && filteredVillages.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border-2 overflow-hidden z-50 shadow-lg"
                        style={{ borderColor: '#DDD3C0', background: '#F7F2E9' }}>
                        {filteredVillages.map((village) => (
                          <button
                            key={village}
                            type="button"
                            className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#EAE4D7] transition-colors"
                            style={{ color: '#2B2420' }}
                            onClick={() => {
                              handleInputChange("location", village)
                              setShowSuggestions(false)
                            }}
                          >
                            {village}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass} style={labelStyle}>Email address</Label>
                <Input id="email" type="email" placeholder="name@email.com" value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={inputClass} style={inputStyle} required />
              </div>

              {/* Passwords */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className={labelClass} style={labelStyle}>Password</Label>
                  <Input id="password" type="password" placeholder="At least 6 characters" value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={inputClass} style={inputStyle} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className={labelClass} style={labelStyle}>Confirm password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Re-enter password" value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={inputClass} style={inputStyle} required />
                </div>
              </div>

              {/* Role Details */}
              <div className="pt-3 border-t" style={{ borderColor: '#DDD3C0' }}>
                <span className={`${labelClass} block mb-3`} style={labelStyle}>
                  {isFarmer ? 'Farm details' : 'Buyer details'}
                </span>
                {isFarmer ? (
                  <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize" className={labelClass} style={labelStyle}>Farm size</Label>
                      <Input id="farmSize" placeholder="e.g. 5 acres" value={formData.farmSize}
                        onChange={(e) => handleInputChange("farmSize", e.target.value)}
                        className={inputClass} style={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmingExperience" className={labelClass} style={labelStyle}>Farming experience</Label>
                      <Input id="farmingExperience" placeholder="e.g. 8 years" value={formData.farmingExperience}
                        onChange={(e) => handleInputChange("farmingExperience", e.target.value)}
                        className={inputClass} style={inputStyle} />
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className={labelClass} style={labelStyle}>Business name</Label>
                      <Input id="businessName" placeholder="e.g. Freetown Foods" value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        className={inputClass} style={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType" className={labelClass} style={labelStyle}>Business type</Label>
                      <select
                        id="businessType"
                        value={formData.businessType}
                        onChange={(e) => handleInputChange("businessType", e.target.value)}
                        className="h-[52px] w-full rounded-xl border-2 px-4 text-sm font-medium focus:outline-none transition-all"
                        style={inputStyle}
                      >
                        <option value="">Select type</option>
                        <option value="retail">Retail Store</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="wholesale">Wholesale Buyer</option>
                        <option value="other">Other / Individual</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full h-[52px] rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-opacity active:scale-[0.99] disabled:opacity-60 mt-3"
                style={{ background: '#E8A33D', color: '#2B2420' }}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-[#2B2420]/30 border-t-[#2B2420] animate-spin" />
                    <span>Creating account…</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: '#DDD3C0' }}>
              <p className="text-sm" style={{ color: '#5C524B' }}>
                Already have an account?{" "}
                <Link href="/login" className="font-bold underline" style={{ color: '#1E3A5F' }}>
                  Log In
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
