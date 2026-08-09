'use client'

import * as React from 'react'
import { Camera, Check, Loader2, TriangleAlert } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { authApi } from '@/lib/auth/api'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader, Panel, RoleBadge } from '@/components/admin/primitives'

export default function AdminProfilePage() {
  const { user, refreshUser } = useAuth()

  // Personal information
  const [firstName, setFirstName] = React.useState(user?.firstName || '')
  const [lastName, setLastName] = React.useState(user?.lastName || '')
  const [infoSaving, setInfoSaving] = React.useState(false)
  const [infoSaved, setInfoSaved] = React.useState(false)
  const [infoError, setInfoError] = React.useState<string | null>(null)

  // Avatar
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  // Password
  const [pwSaved, setPwSaved] = React.useState(false)
  const [pwError, setPwError] = React.useState<string | null>(null)
  const [pwLoading, setPwLoading] = React.useState(false)
  const [currentPw, setCurrentPw] = React.useState('')
  const [newPw, setNewPw] = React.useState('')
  const [confirmPw, setConfirmPw] = React.useState('')

  React.useEffect(() => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
  }, [user?.firstName, user?.lastName])

  async function handleInfoSave(e: React.FormEvent) {
    e.preventDefault()
    setInfoError(null)
    setInfoSaving(true)
    try {
      await authApi.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() })
      await refreshUser()
      setInfoSaved(true)
      setTimeout(() => setInfoSaved(false), 3000)
    } catch (err: any) {
      setInfoError(err.data?.message || err.message || 'Could not update your profile.')
    } finally {
      setInfoSaving(false)
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB.')
      return
    }

    setUploadError(null)
    setUploading(true)
    try {
      await authApi.uploadProfilePhoto(file)
      await refreshUser()
    } catch (err: any) {
      setUploadError(err.data?.message || err.message || 'Could not upload photo.')
    } finally {
      setUploading(false)
    }
  }

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

    setPwLoading(true)
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
      setPwLoading(false)
    }
  }

  const initials = (user?.firstName?.[0] || 'A') + (user?.lastName?.[0] || 'D')

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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="group relative flex size-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-display font-semibold text-lg"
                  aria-label="Change profile photo"
                >
                  {user?.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profilePhotoUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin text-white" />
                    ) : (
                      <Camera className="size-4 text-white" />
                    )}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>
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

            {uploadError && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                <TriangleAlert />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleInfoSave}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input readOnly value={user?.email || ''} className="bg-muted/50" />
                </Field>
                <Field>
                  <FieldLabel>Role Policy</FieldLabel>
                  <Input readOnly value={`${user?.role || 'SuperAdmin'} (Full Administrative Access)`} className="bg-muted/50" />
                </Field>

                {infoError && <p className="text-xs text-destructive">{infoError}</p>}

                <div className="flex items-center gap-3 pt-1">
                  <Button type="submit" size="sm" disabled={infoSaving}>
                    {infoSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
                    {infoSaving ? 'Saving…' : 'Save changes'}
                  </Button>
                  {infoSaved && (
                    <span className="flex items-center gap-1.5 text-xs text-farmer font-medium">
                      <Check className="size-3.5" aria-hidden />
                      Profile updated
                    </span>
                  )}
                </div>
              </FieldGroup>
            </form>
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
                <Button type="submit" disabled={pwLoading} size="sm">
                  {pwLoading ? 'Updating…' : 'Update Password'}
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
