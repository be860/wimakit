"use client"

import type React from "react"
import { authAPI, setAuthToken } from "@/lib/api"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole } from "@/lib/types"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [role, setRole] = useState<UserRole>("buyer")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    // Farmer specific
    farmSize: "",
    farmingExperience: "",
    // Buyer specific
    businessName: "",
    businessType: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "farmer" || roleParam === "buyer") {
      setRole(roleParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        farmSize: role === "farmer" ? formData.farmSize : undefined,
        farmingExperience: role === "farmer" ? formData.farmingExperience : undefined,
        businessName: role === "buyer" ? formData.businessName : undefined,
        businessType: role === "buyer" ? formData.businessType : undefined,
      })

      // Store token and user info
      setAuthToken(response.token)
      localStorage.setItem("wimakit_user", JSON.stringify(response.user))

      setSuccess(true)
      setError("")

      // Show success message
      setTimeout(() => {
        setError("Account created! Please check your email to verify your account before logging in.")
      }, 100)

      // Redirect to verification page after showing message
      setTimeout(() => {
        router.push("/verify-email")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">WiMakit</span>
          </Link>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register as a {role === "farmer" ? "Farmer" : "Buyer"}</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-primary/10 text-primary border-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Account created! Check your email to verify your account before logging in.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+232 XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, District"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    required
                  />
                </div>
              </div>

              {role === "farmer" ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">Farm Size</Label>
                      <Input
                        id="farmSize"
                        placeholder="e.g., 5 acres"
                        value={formData.farmSize}
                        onChange={(e) => handleInputChange("farmSize", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="farmingExperience">Farming Experience</Label>
                      <Input
                        id="farmingExperience"
                        placeholder="e.g., 10 years"
                        value={formData.farmingExperience}
                        onChange={(e) => handleInputChange("farmingExperience", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        placeholder="Your business name"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => handleInputChange("businessType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail Store</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || success}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
