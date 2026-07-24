import { Suspense } from "react"
import Link from "next/link"
import { Sprout } from "lucide-react"
import VerifyEmailContent from "@/components/verify-email-content"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">WiMakit</span>
          </Link>
          <p className="text-muted-foreground">Email Verification</p>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <Link href="/" className="text-primary hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
