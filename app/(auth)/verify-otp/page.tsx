import { Suspense } from 'react'
import type { Metadata } from 'next'

import { OtpForm } from '@/components/auth/otp-form'

export const metadata: Metadata = {
  title: 'Verify your email',
  description: 'Enter the 6-digit verification code sent to your email address.',
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  )
}
