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

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    // Mock request — always reports success so no account can be probed.
    window.setTimeout(() => {
      setPending(false)
      setSent(true)
    }, 600)
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        description={`If an account exists for ${email}, a reset link is on its way.`}
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
          <AlertTitle>Reset link sent</AlertTitle>
          <AlertDescription>
            The link expires in 30 minutes. Check your spam folder if it does not arrive.
          </AlertDescription>
        </Alert>

        <Link
          href={`/change-password?email=${encodeURIComponent(email)}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'mt-5 w-full')}
        >
          Open the reset form
        </Link>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Demo shortcut — no email is actually sent.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email you registered with and we will send a reset link."
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
            {pending ? 'Sending link…' : 'Send reset link'}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}

/* --------------------------- change password ------------------------------ */

export function ChangePasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email')

  const [current, setCurrent] = React.useState('')
  const [next, setNext] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const mismatch = confirm.length > 0 && next !== confirm
  const tooWeak = next.length > 0 && passwordStrength(next).score < 2

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mismatch || tooWeak) return
    setPending(true)
    // Mock update — simulated latency only.
    window.setTimeout(() => {
      setPending(false)
      setDone(true)
    }, 600)
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
          onClick={() => router.push('/farmer')}
        >
          Continue to dashboard
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Set a new password"
      description={
        email
          ? `Choose a password for ${email}.`
          : 'Choose a password you have not used before.'
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
        <AlertTitle>Temporary password in use</AlertTitle>
        <AlertDescription>
          You must replace the temporary password emailed to you before using WiMakit.
        </AlertDescription>
      </Alert>

      <form onSubmit={submit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="current-password">Temporary password</FieldLabel>
            <Input
              id="current-password"
              required
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
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
            disabled={pending || mismatch || tooWeak}
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
