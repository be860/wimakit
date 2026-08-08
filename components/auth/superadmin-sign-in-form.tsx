'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck, TriangleAlert } from 'lucide-react';

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
import { authApi } from '@/lib/auth/api';

export function SuperAdminSignInForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // Forced password change state
  const [mustChangePassword, setMustChangePassword] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  const [pending, setPending] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setPending(true);

    try {
      const user = await login(email.trim(), password);
      setPending(false);

      if (user.role !== 'SuperAdmin' && user.role !== 'admin' && user.role !== 'superadmin') {
        setErrorMessage('Access restricted. This endpoint is for platform SuperAdmin oversight staff only.');
        return;
      }

      if ((user as any).mustChangePassword || (user as any).MustChangePassword) {
        setMustChangePassword(true);
        return;
      }

      router.push('/admin');
    } catch (err: any) {
      setPending(false);
      const msg = err.data?.message || err.message || 'Authentication failed. Verify credentials.';
      setErrorMessage(msg);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setPending(true);

    try {
      await authApi.changePassword({
        currentPassword: password,
        newPassword,
      });

      setPending(false);
      setSuccessMessage('Password changed successfully! Redirecting to oversight dashboard…');
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err: any) {
      setPending(false);
      const msg = err.data?.message || err.message || 'Failed to update password.';
      setErrorMessage(msg);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 font-sans">
      <div className="w-full max-w-md">

        {/* Minimal header badge */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-white p-2 mb-3 shadow-inner">
            <img
              src="/wimakit-icon.png"
              alt="WiMakit"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100">WiMakit Platform Oversight</h1>
          <p className="mt-1 text-xs text-slate-400">Secure SuperAdmin Access Control · Restricted</p>
        </div>

        {/* Alert feedback */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6 border-red-500/30 bg-red-950/40 text-red-200">
            <TriangleAlert className="size-4" />
            <AlertTitle className="text-xs font-semibold">Access Notice</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-emerald-500/30 bg-emerald-950/40 text-emerald-200">
            <ShieldCheck className="size-4 text-emerald-400" />
            <AlertTitle className="text-xs font-semibold">Verification Complete</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
          {!mustChangePassword ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-sm font-medium text-slate-200">SuperAdmin Credentials</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Enter authorized administration credentials to proceed.</p>
              </div>

              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="sa-email" className="text-xs font-medium text-slate-300">Admin Email</FieldLabel>
                  <Input
                    id="sa-email"
                    type="email"
                    required
                    placeholder="admin@wimakit.sl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20 text-xs h-10"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="sa-password" className="text-xs font-medium text-slate-300">Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="sa-password"
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20 text-xs h-10"
                    />
                    <InputGroupAddon align="inline-end" className="bg-slate-950/60 border-slate-800">
                      <InputGroupButton
                        size="icon-xs"
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-emerald-600 text-slate-950 font-semibold hover:bg-emerald-500 text-xs h-10 transition-colors shadow-sm"
                >
                  {pending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Lock className="size-3.5 mr-2" />}
                  {pending ? 'Authenticating…' : 'Authenticate Access'}
                </Button>
              </FieldGroup>
            </form>
          ) : (
            /* Mandatory Password Change Form */
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <KeyRound className="size-4" />
                  <h2 className="text-sm font-semibold">Password Change Required</h2>
                </div>
                <p className="text-[11px] text-slate-400">
                  Initial SuperAdmin credential detected. You must change your default password before accessing the system.
                </p>
              </div>

              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="sa-new-pw" className="text-xs font-medium text-slate-300">New Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="sa-new-pw"
                      required
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 text-xs h-10"
                    />
                    <InputGroupAddon align="inline-end" className="bg-slate-950/60 border-slate-800">
                      <InputGroupButton
                        size="icon-xs"
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="sa-confirm-pw" className="text-xs font-medium text-slate-300">Confirm New Password</FieldLabel>
                  <Input
                    id="sa-confirm-pw"
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 text-xs h-10"
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-emerald-600 text-slate-950 font-semibold hover:bg-emerald-500 text-xs h-10 transition-colors shadow-sm"
                >
                  {pending ? <Loader2 className="size-4 animate-spin mr-2" /> : <ShieldCheck className="size-4 mr-2" />}
                  {pending ? 'Updating Password…' : 'Set New Password & Continue'}
                </Button>
              </FieldGroup>
            </form>
          )}
        </div>

        {/* Security Notice Footer */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          WiMakit Security Policy · All SuperAdmin actions are recorded in immutable audit logs.
        </div>
      </div>
    </div>
  );
}
