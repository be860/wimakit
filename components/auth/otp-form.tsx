'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CircleCheck, Loader2, MailCheck, RotateCcw, TriangleAlert } from 'lucide-react'

import { apiClient } from '@/lib/api-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { AuthCard, RegistrationTracker } from '@/components/auth/primitives'

const RESEND_SECONDS = 30

export function OtpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? 'your email'

  const [code, setCode] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [invalid, setInvalid] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)
  const [seconds, setSeconds] = React.useState(RESEND_SECONDS)

  React.useEffect(() => {
    if (seconds <= 0) return
    const timer = window.setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearInterval(timer)
  }, [seconds])

  async function verify(value: string) {
    setPending(true)
    setInvalid(false)
    setErrorMsg(null)

    try {
      await apiClient.post('/api/auth/verify-otp', {
        email: email.trim(),
        otp: value,
      })
      setPending(false)
      setDone(true)
    } catch (err: any) {
      setPending(false)
      setInvalid(true)
      setCode('')
      setErrorMsg(err.data?.message || 'Verification failed. That OTP code is incorrect or expired.')
    }
  }

  async function resend() {
    if (seconds > 0) return
    try {
      await apiClient.post('/api/auth/request-otp', { email: email.trim() })
      setSeconds(RESEND_SECONDS)
    } catch {
      setSeconds(RESEND_SECONDS)
    }
  }

  if (done) {
    return (
      <AuthCard
        title="Email verified"
        description={`${email} is confirmed. Your registration is now with the WiMakit review team.`}
      >
        <Alert className="border-farmer/30 bg-farmer/10">
          <CircleCheck className="text-farmer" />
          <AlertTitle>Registration submitted for review</AlertTitle>
          <AlertDescription>
            Verification usually takes 2–3 working days. We will email confirmation once your account is approved.
          </AlertDescription>
        </Alert>

        <div className="mt-5">
          <RegistrationTracker current={2} />
        </div>

        <Button
          className="mt-5 w-full bg-farmer text-background hover:bg-farmer/90"
          onClick={() => router.push('/sign-in')}
        >
          Back to sign in
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Verify your email"
      description={`We sent a 6-digit code to ${email}.`}
      footer={
        <p className="text-muted-foreground">
          Wrong address?{' '}
          <Link href="/sign-up" className="font-medium text-farmer hover:underline">
            Start registration again
          </Link>
        </p>
      }
    >
      {invalid && (
        <Alert
          variant="destructive"
          className="mb-4 border-destructive/30 bg-destructive/10"
        >
          <TriangleAlert />
          <AlertTitle>Verification error</AlertTitle>
          <AlertDescription>
            {errorMsg || 'Check the code in your email, or request a new one.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={6}
          value={code}
          disabled={pending}
          onChange={(value) => {
            setCode(value)
            setInvalid(false)
            if (value.length === 6) verify(value)
          }}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        {pending && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Verifying code…
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={seconds > 0}
          onClick={resend}
        >
          <RotateCcw data-icon="inline-start" />
          {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
        </Button>
      </div>
    </AuthCard>
  )
}
