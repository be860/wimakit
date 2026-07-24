"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authAPI } from "@/lib/api"

export default function VerifyEmailContent() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (token.length < 4) {
      setStatus("error")
      setMessage("Please enter a valid verification code.")
      return
    }

    setIsLoading(true)
    setStatus("verifying")
    setMessage("")

    try {
      const response = await authAPI.verifyEmail(token)
      setStatus("success")
      setMessage(response.message || "Your email has been verified successfully!")
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Verification failed. The code may be incorrect or expired.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center">
          {status === "idle" && <Mail className="h-16 w-16 text-primary mb-4" />}
          {status === "verifying" && <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />}
          {status === "success" && <CheckCircle2 className="h-16 w-16 text-primary mb-4" />}
          {status === "error" && <XCircle className="h-16 w-16 text-destructive mb-4" />}

          <CardTitle className="text-center">
            {status === "idle" && "Check Your Email"}
            {status === "verifying" && "Verifying Code"}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-center mt-2">
            {status === "idle" && "Enter the 6-digit code sent to your email address."}
            {status === "verifying" && "Please wait while we verify your code..."}
            {status === "success" && message}
            {status === "error" && message}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {status === "success" && (
          <Alert className="bg-primary/10 text-primary border-primary mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>You can now login to your account</AlertDescription>
          </Alert>
        )}

        {status !== "success" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token" className="sr-only">Verification Code</Label>
              <Input
                id="token"
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isLoading || token.length < 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        )}

        <div className="mt-4 space-y-3">
          {status === "success" && (
            <Button onClick={() => router.push("/login")} className="w-full h-12 text-lg">
              Go to Login
            </Button>
          )}

          {status === "error" && (
            <Button
              onClick={() => setStatus("idle")}
              variant="outline"
              className="w-full"
            >
              Try Another Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
