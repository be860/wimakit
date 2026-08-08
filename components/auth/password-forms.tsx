'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CircleCheck,
  KeyRound,
  Loader2,
  MailCheck,
  TriangleAlert,
} from 'lucide-react'

import { passwordStrength } from '@/lib/auth/mock-auth'
import { authApi } from '@/lib/auth/api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AuthCard, PasswordStrength } from '@/components/auth/primitives'

/* --------------------------- forgot password ------------------------------ */

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    try {
      // Backend always returns a generic success response, whether or not the
      // account exists, so this can't be used to probe for registered emails.
      await authApi.forgotPassword(email.trim())
    } catch {
      // Swallow errors here too — never reveal account existence or surface
      // transient failures on this screen.
    } finally {
      setPending(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        description={`If an account exists for ${email}, a reset code is on its way.`}
        footer={
          <Link
            href="/sign-in"
            className="font-medium text-farmer hover:underline"
          >
            Back to sign in
          </Link>
        }
      >
        <Alert className="border-farmer/30 bg-farmer/10">
          <MailCheck className="text-farmer" />
          <AlertTitle>Reset code sent</AlertTitle>
          <AlertDescription>
            The code expires in 15 minutes. Check your spam folder if it does not arrive.
          </AlertDescription>
        </Alert>

        <Link
          href={`/change-password?email=${encodeURIComponent(email)}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-5 w-full')}
        >
          Enter your reset code
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email you registered with and we will send a reset code."
      footer={
        <Link href="/sign-in" className="font-medium text-farmer hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="reset-email">Email address</FieldLabel>
            <Input
              id="reset-email"
              required
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FieldDescription>
              For security we send the same response whether or not the account exists.
            </FieldDescription>
          </Field>

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="bg-farmer text-background hover:bg-farmer/90"
          >
            {pending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <KeyRound data-icon="inline-start" />
            )}
            {pending ? 'Sending code…' : 'Send reset code'}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}

/* --------------------------- reset password -------------------------------- */

export function ChangePasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const initialEmail = params.get('email') ?? ''

  const [email, setEmail] = React.useState(initialEmail)
  const [otp, setOtp] = React.useState('')
  const [next, setNext] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const mismatch = confirm.length > 0 && next !== confirm
  const tooWeak = next.length > 0 && passwordStrength(next).score < 2
  const otpInvalid = otp.length > 0 && !/^\d{6}$/.test(otp)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)
    if (mismatch || tooWeak || otpInvalid) return

    setPending(true)
    try {
      await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: next,
      })
      setPending(false)
      setDone(true)
    } catch (err: any) {
      setPending(false)
      setErrorMessage(err.data?.message || err.message || 'Could not reset your password. Please try again.')
    }
  }

  if (done) {
    return (
      <AuthCard
        title="Password updated"
        description="Your new password is active. Use it next time you sign in."
      >
        <Alert className="border-farmer/30 bg-farmer/10">
          <CircleCheck className="text-farmer" />
          <AlertTitle>All set</AlertTitle>
          <AlertDescription>
            For your security, sessions on other devices have been signed out.
          </AlertDescription>
        </Alert>

        <Button
          className="mt-5 w-full bg-farmer text-background hover:bg-farmer/90"
          onClick={() => router.push('/sign-in')}
        >
          Continue to sign in
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Set a new password"
      description={
        email
          ? `Enter the code sent to ${email} and choose a new password.`
          : 'Enter your email, the code we sent you, and a new password.'
      }
      footer={
        <Link
          href="/sign-in"
          className="flex items-center gap-1.5 font-medium text-farmer hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      }
    >
      <Alert className="mb-4 border-gold/40 bg-gold/10">
        <TriangleAlert className="text-gold-foreground" />
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          We emailed a 6-digit reset code. It expires 15 minutes after you request it.
        </AlertDescription>
      </Alert>

      {errorMessage && (
        <Alert variant="destructive" className="mb-4 border-destructive/30 bg-destructive/10">
          <TriangleAlert />
          <AlertTitle>Could not reset password</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={submit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="reset-form-email">Email address</FieldLabel>
            <Input
              id="reset-form-email"
              required
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field data-invalid={otpInvalid || undefined}>
            <FieldLabel htmlFor="reset-otp">Reset code</FieldLabel>
            <Input
              id="reset-otp"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-invalid={otpInvalid}
              placeholder="6-digit code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            {otpInvalid && <FieldError>Enter the 6-digit code from your email.</FieldError>}
          </Field>

          <Field data-invalid={tooWeak || undefined}>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <Input
              id="new-password"
              required
              type="password"
              autoComplete="new-password"
              aria-invalid={tooWeak}
              placeholder="••••••••"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <PasswordStrength password={next} />
          </Field>

          <Field data-invalid={mismatch || undefined}>
            <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
            <Input
              id="confirm-password"
              required
              type="password"
              autoComplete="new-password"
              aria-invalid={mismatch}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {mismatch && <FieldError>Both passwords must match.</FieldError>}
          </Field>

          <Button
            type="submit"
            size="lg"
            disabled={pending || mismatch || tooWeak || otpInvalid}
            className="bg-farmer text-background hover:bg-farmer/90"
          >
            {pending && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {pending ? 'Updating…' : 'Update password'}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
