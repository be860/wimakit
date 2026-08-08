'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ShieldAlert, TriangleAlert } from 'lucide-react';

import { useAuth } from '@/components/providers/auth-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

export function SignInForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuspended, setIsSuspended] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSuspended(false);
    setPending(true);

    try {
      const user = await login(email.trim(), password);
      setPending(false);

      if (user.status === 'Suspended' || user.verificationStatus === 'Suspended') {
        setIsSuspended(true);
        return;
      }

      if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'SuperAdmin') {
        router.push('/admin');
      } else {
        router.push('/farmer');
      }
    } catch (err: any) {
      setPending(false);
      const msg = err.data?.message || err.message || 'Incorrect email or password.';
      if (msg.toLowerCase().includes('suspended')) {
        setIsSuspended(true);
      } else {
        setErrorMessage(msg);
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header banner */}
      <div className="border-b border-border bg-farmer/8 px-5 py-3.5">
        <div className="mx-auto flex max-w-sm items-center justify-center">
          <img
            src="/wimakit-logo-horizontal.png"
            alt="WiMakit — Digital Agri-Marketplace"
            className="h-9 w-auto object-contain"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          {/* Welcome section */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Wetin you want do?</h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Sign in to manage your farm listings, orders, and payments on WiMakit.
            </p>
          </div>

          {/* Error alerts */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-4 border-destructive/30 bg-destructive/10">
              <TriangleAlert />
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {isSuspended && (
            <Alert variant="destructive" className="mb-4 border-destructive/30 bg-destructive/10">
              <ShieldAlert />
              <AlertTitle>Account Suspended</AlertTitle>
              <AlertDescription className="flex flex-col items-start gap-2">
                This account has been suspended by the WiMakit oversight team. You cannot sign in until it is reinstated.
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Form card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-semibold">Sign in to your account</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Farmers, buyers, and platform staff sign in here.
              </p>
            </div>

            <div className="px-5 py-5">
              <form onSubmit={submit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="yourname@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between gap-2">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-farmer hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <InputGroup>
                      <InputGroupInput
                        id="password"
                        required
                        type={show ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-xs"
                          type="button"
                          aria-label={show ? 'Hide password' : 'Show password'}
                          onClick={() => setShow((v) => !v)}
                        >
                          {show ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={pending}
                    className="w-full bg-farmer text-background hover:bg-farmer/90"
                  >
                    {pending ? (
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : null}
                    {pending ? 'Signing in…' : 'Sign in'}
                  </Button>
                </FieldGroup>
              </form>
            </div>

            <div className="border-t border-border bg-secondary/40 px-5 py-3.5 text-sm">
              <p className="text-muted-foreground text-center">
                New farmer?{' '}
                <Link href="/sign-up" className="font-medium text-farmer hover:underline">
                  Create a farmer account
                </Link>
              </p>
            </div>
          </div>

          {/* Help callout — for low-literacy users */}
          <div className="mt-4 rounded-lg border border-border bg-secondary/40 px-4 py-3.5">
            <p className="text-xs font-medium text-foreground">Need help signing in?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              If you forgot your password or are signing in for the first time, use <strong>Forgot password?</strong> above. You will receive a code on your email.
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              For assistance, call WiMakit support: <strong className="text-foreground">+232 73 834941</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
