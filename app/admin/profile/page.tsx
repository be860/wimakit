'use client'

import * as React from 'react'
import { Check, KeyRound, Shield, User } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { authApi } from '@/lib/auth/api'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PageHeader, Panel, RoleBadge } from '@/components/admin/primitives'

export default function AdminProfilePage() {
  const { user } = useAuth()
  const [pwSaved, setPwSaved] = React.useState(false)
  const [pwError, setPwError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const [currentPw, setCurrentPw] = React.useState('')
  const [newPw, setNewPw] = React.useState('')
  const [confirmPw, setConfirmPw] = React.useState('')

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError(null)

    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.')
      return
    }

    if (newPw.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await authApi.changePassword({ currentPassword: currentPw, newPassword: newPw })
      setPwSaved(true)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err: any) {
      setPwError(err.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin Profile"
        description="Manage your account details and security settings."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Personal Information" bodyClassName="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-semibold text-lg">
                {(user?.firstName?.[0] || 'A') + (user?.lastName?.[0] || 'D')}
              </span>
              <div className="flex flex-col">
                <span className="font-medium text-base">
                  {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'SuperAdmin'}
                </span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <div className="mt-1">
                  <RoleBadge role={user?.role || 'SuperAdmin'} />
                </div>
              </div>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel>First Name</FieldLabel>
                <Input readOnly value={user?.firstName || ''} className="bg-muted/50" />
              </Field>
              <Field>
                <FieldLabel>Last Name</FieldLabel>
                <Input readOnly value={user?.lastName || ''} className="bg-muted/50" />
              </Field>
              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <Input readOnly value={user?.email || ''} className="bg-muted/50" />
              </Field>
              <Field>
                <FieldLabel>Role Policy</FieldLabel>
                <Input readOnly value="SuperAdmin (Full Administrative Access)" className="bg-muted/50" />
              </Field>
            </FieldGroup>
          </div>
        </Panel>

        <Panel title="Security & Password" bodyClassName="p-4">
          <form onSubmit={handlePasswordChange}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="c-current">Current Password</FieldLabel>
                <Input
                  id="c-current"
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="c-new">New Password</FieldLabel>
                <Input
                  id="c-new"
                  type="password"
                  required
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="c-confirm">Confirm New Password</FieldLabel>
                <Input
                  id="c-confirm"
                  type="password"
                  required
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              {pwError && (
                <p className="text-xs text-destructive">{pwError}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? 'Updating…' : 'Update Password'}
                </Button>
                {pwSaved && (
                  <span className="flex items-center gap-1.5 text-xs text-farmer font-medium">
                    <Check className="size-3.5" aria-hidden />
                    Password updated successfully
                  </span>
                )}
              </div>
            </FieldGroup>
          </form>
        </Panel>
      </div>
    </div>
  )
}
