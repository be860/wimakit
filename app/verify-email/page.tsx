import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import VerifyEmailContent from "@/components/verify-email-content"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: "#F7F2E9", color: "#2B2420" }}>
      {/* Back link */}
      <div className="px-5 pt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: "#5C524B" }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <Suspense fallback={<div className="text-center" style={{ color: "#5C524B" }}>Loading verification form...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>

      <footer className="py-6 text-center text-xs" style={{ color: "#5C524B", opacity: 0.6 }}>
        <p>&copy; {new Date().getFullYear()} WiMakit. Sierra Leone.</p>
      </footer>
    </div>
  )
}
