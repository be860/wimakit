'use client'

import * as React from 'react'
import { Camera, Check, FileImage, Loader2 } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { authApi } from '@/lib/auth/api'
import { farmerApi } from '@/lib/farmer/api'
import { ApiClientError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Panel, VerificationBadge } from '@/components/farmer/primitives'

const SIERRA_LEONE_DISTRICTS = [
  'Waterloo',
  'Rokel',
  'Tombo',
  'Newton',
  'Benguema',
  'Grafton',
  'Hastings',
  'Regent',
  'Goderich',
  'York',
  'Kent',
  'Tokeh',
  'Mama Beach',
  'Kerry Town',
  'Russell',
  'Campbell Town',
  'Songo',
  'Leicester',
  'Gloucester',
  'Bathurst',
  'Charlotte',
  'Dublin (Banana Islands)',
]

const CROP_OPTIONS = [
  'Cassava',
  'Rice',
  'Sweet Potato',
  'Groundnut',
  'Maize',
  'Yam',
  'Potato',
  'Cocoa',
  'Coffee',
  'Palm Oil',
  'Vegetables',
  'Fruits',
]

type PreferenceKey = 'notifyNewOrders' | 'notifyListingApprovals' | 'notifyMessages' | 'notifyBroadcasts'

const preferences: { key: PreferenceKey; label: string; description: string }[] = [
  { key: 'notifyNewOrders', label: 'New orders', description: 'Alert me when a buyer places an order.' },
  { key: 'notifyListingApprovals', label: 'Listing approvals', description: 'Tell me when a product is approved or rejected.' },
  { key: 'notifyMessages', label: 'Messages', description: 'Notify me about new buyer messages.' },
  { key: 'notifyBroadcasts', label: 'Platform broadcasts', description: 'Advisories and notices from WiMakit.' },
]

function initialsOf(name?: string) {
  if (!name) return 'F'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'F'
}

export function SettingsView() {
  const { user, refreshUser } = useAuth()

  return (
    <Tabs defaultValue="profile" className="gap-4">
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="farm">Farm details</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab user={user} refreshUser={refreshUser} />
      </TabsContent>

      <TabsContent value="farm">
        <FarmTab user={user} refreshUser={refreshUser} />
      </TabsContent>

      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsTab user={user} refreshUser={refreshUser} />
      </TabsContent>
    </Tabs>
  )
}

/* ------------------------------- profile tab ------------------------------- */

function ProfileTab({
  user,
  refreshUser,
}: {
  user: ReturnType<typeof useAuth>['user']
  refreshUser: ReturnType<typeof useAuth>['refreshUser']
}) {
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [district, setDistrict] = React.useState(user?.district || SIERRA_LEONE_DISTRICTS[0])

  React.useEffect(() => {
    if (user?.district) setDistrict(user.district)
  }, [user?.district])

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Panel
        title="Personal Information"
        description="Shown to WiMakit staff only — never to buyers"
        className="xl:col-span-2"
        bodyClassName="p-4"
      >
        <div className="mb-5 flex items-center gap-4">
          <ProfilePhotoUploader user={user} refreshUser={refreshUser} />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">{user?.fullName || 'Farmer'}</p>
            <p className="text-xs text-muted-foreground">
              This photo is shown on your public seller profile and listings.
            </p>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            const fd = new FormData(e.currentTarget)
            setSaving(true)
            try {
              await farmerApi.updateProfile({
                firstName: (fd.get('firstName') as string) || user?.firstName || '',
                lastName: (fd.get('lastName') as string) || user?.lastName || '',
                phone: (fd.get('phone') as string) || '',
                district,
                chiefdom: (fd.get('chiefdom') as string) || '',
                community: (fd.get('community') as string) || '',
              })
              await refreshUser()
              setSaved(true)
              setTimeout(() => setSaved(false), 3000)
            } catch (err) {
              setError(err instanceof ApiClientError ? err.message : 'Could not save your changes.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="s-fname">First Name</FieldLabel>
                <Input id="s-fname" name="firstName" defaultValue={user?.firstName || ''} />
              </Field>
              <Field>
                <FieldLabel htmlFor="s-lname">Last Name</FieldLabel>
                <Input id="s-lname" name="lastName" defaultValue={user?.lastName || ''} />
              </Field>
              <Field>
                <FieldLabel htmlFor="s-email">Email</FieldLabel>
                <Input id="s-email" name="email" type="email" defaultValue={user?.email || ''} disabled />
                <FieldDescription>Contact WiMakit support to change your email.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="s-phone">Phone Number</FieldLabel>
                <Input id="s-phone" name="phone" defaultValue={user?.phone || ''} />
              </Field>
              <Field>
                <FieldLabel htmlFor="s-district">District</FieldLabel>
                <Select value={district} onValueChange={(v) => setDistrict(v as string)}>
                  <SelectTrigger id="s-district">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIERRA_LEONE_DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="s-chiefdom">Chiefdom</FieldLabel>
                <Input id="s-chiefdom" name="chiefdom" defaultValue={user?.chiefdom || ''} />
              </Field>
              <Field>
                <FieldLabel htmlFor="s-community">Community</FieldLabel>
                <Input id="s-community" name="community" defaultValue={user?.community || ''} />
              </Field>
            </div>

            {error && <FieldError>{error}</FieldError>}

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="bg-farmer text-background hover:bg-farmer/90"
              >
                {saving && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
                Save changes
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-farmer">
                  <Check className="size-3.5" aria-hidden />
                  Profile updated
                </span>
              )}
            </div>
          </FieldGroup>
        </form>
      </Panel>

      <div className="flex flex-col gap-4">
        <Panel
          title="Verification"
          description="Reviewed by the SuperAdmin team"
          bodyClassName="flex flex-col gap-3 p-4"
        >
          <VerificationBadge status={user?.verificationStatus || 'Pending'} />
          <dl className="flex flex-col gap-2 text-sm">
            {[
              ['Registered', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'],
              ['Role', user?.role || 'Farmer'],
              ['ID', String(user?.id || '—')],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="tabular text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel
          title="Documents"
          description="Used for identity and farm verification"
          bodyClassName="flex flex-col gap-2 p-4"
        >
          <DocRow label="Profile Photo" url={user?.profilePhotoUrl} />
          <DocRow label={`${user?.idDocumentType || 'ID document'} (Front)`} url={user?.idDocumentFrontUrl} />
          <DocRow label={`${user?.idDocumentType || 'ID document'} (Back)`} url={user?.idDocumentBackUrl} />
          <DocRow label="Farm Photo" url={user?.farmPhotoUrl} />
        </Panel>
      </div>
    </div>
  )
}

function DocRow({ label, url }: { label: string; url?: string }) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
        url
          ? 'border-farmer/30 bg-farmer/8 text-foreground'
          : 'border-border bg-secondary/40 text-muted-foreground',
      )}
    >
      {url ? (
        <img src={url} alt={label} className="size-8 shrink-0 rounded object-cover" />
      ) : (
        <FileImage className="size-4 shrink-0" aria-hidden />
      )}
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{label}</span>
        <span className="text-[11px] text-muted-foreground">
          {url ? 'Uploaded during registration' : 'Not uploaded'}
        </span>
      </span>
    </div>
  )

  if (!url) return content
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {content}
    </a>
  )
}

function ProfilePhotoUploader({
  user,
  refreshUser,
}: {
  user: ReturnType<typeof useAuth>['user']
  refreshUser: ReturnType<typeof useAuth>['refreshUser']
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleFile(file: File | null) {
    if (!file) return
    setError(null)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    try {
      await farmerApi.uploadProfilePhoto(file)
      await refreshUser()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not upload photo.')
    } finally {
      setUploading(false)
    }
  }

  const photoSrc = preview || user?.profilePhotoUrl

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative flex size-16 shrink-0 items-center justify-center rounded-full outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-farmer"
      >
        <Avatar className="size-16">
          {photoSrc && <AvatarImage src={photoSrc} alt={user?.fullName || 'Profile photo'} />}
          <AvatarFallback className="bg-farmer text-base text-background">
            {initialsOf(user?.fullName)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </span>
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-[11px] font-medium text-farmer hover:underline disabled:opacity-60"
      >
        {uploading ? 'Uploading…' : 'Change photo'}
      </button>
      {error && <p className="max-w-[8rem] text-center text-[11px] text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

/* -------------------------------- farm tab --------------------------------- */

function FarmTab({
  user,
  refreshUser,
}: {
  user: ReturnType<typeof useAuth>['user']
  refreshUser: ReturnType<typeof useAuth>['refreshUser']
}) {
  const [crops, setCrops] = React.useState<string[]>([])
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (user?.primaryCrops) {
      setCrops(user.primaryCrops.split(',').map((c) => c.trim()).filter(Boolean))
    }
  }, [user?.primaryCrops])

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Panel
        title="Farm Details"
        description="What buyers see on your public seller profile"
        className="xl:col-span-2"
        bodyClassName="p-4"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            const fd = new FormData(e.currentTarget)
            setSaving(true)
            try {
              await farmerApi.updateProfile({
                farmName: (fd.get('farmName') as string) || '',
                farmSize: (fd.get('farmSize') as string) || '',
                farmAddress: (fd.get('farmAddress') as string) || '',
                farmDescription: (fd.get('farmDescription') as string) || '',
                primaryCrops: crops.join(', '),
              })
              await refreshUser()
              setSaved(true)
              setTimeout(() => setSaved(false), 3000)
            } catch (err) {
              setError(err instanceof ApiClientError ? err.message : 'Could not save farm details.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="f-name">Farm Name</FieldLabel>
                <Input id="f-name" name="farmName" defaultValue={user?.farmName || ''} />
              </Field>
              <Field>
                <FieldLabel htmlFor="f-size">Farm Size</FieldLabel>
                <Input id="f-size" name="farmSize" defaultValue={user?.farmSize || ''} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="f-address">Farm Address</FieldLabel>
              <Input id="f-address" name="farmAddress" defaultValue={user?.farmAddress || ''} />
            </Field>
            <Field>
              <FieldLabel>Primary Crops</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {CROP_OPTIONS.map((c) => {
                  const on = crops.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setCrops((prev) =>
                          on ? prev.filter((x) => x !== c) : [...prev, c],
                        )
                      }
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                        on
                          ? 'border-farmer bg-farmer text-background'
                          : 'border-border bg-card text-muted-foreground hover:bg-secondary',
                      )}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
              <FieldDescription>
                Select every crop you sell — buyers filter listings by crop.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="f-desc">Farm Description</FieldLabel>
              <Textarea
                id="f-desc"
                name="farmDescription"
                rows={4}
                defaultValue={user?.farmDescription || ''}
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="w-fit bg-farmer text-background hover:bg-farmer/90"
              >
                {saving && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
                Save farm details
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-farmer">
                  <Check className="size-3.5" aria-hidden />
                  Farm details updated
                </span>
              )}
            </div>
          </FieldGroup>
        </form>
      </Panel>

      <FarmPhotoPanel user={user} refreshUser={refreshUser} />
    </div>
  )
}

function FarmPhotoPanel({
  user,
  refreshUser,
}: {
  user: ReturnType<typeof useAuth>['user']
  refreshUser: ReturnType<typeof useAuth>['refreshUser']
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleFile(file: File | null) {
    if (!file) return
    setError(null)
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      await farmerApi.uploadFarmPhoto(file)
      await refreshUser()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not upload photo.')
    } finally {
      setUploading(false)
    }
  }

  const photoSrc = preview || user?.farmPhotoUrl

  return (
    <Panel title="Farm Photo" description="Shown on your public seller profile" bodyClassName="p-4">
      <div className="flex flex-col gap-3">
        {photoSrc ? (
          <div className="relative overflow-hidden rounded-lg border border-border">
            <img src={photoSrc} alt="Farm photo" className="h-40 w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 text-center">
            <FileImage className="size-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No farm photo yet</p>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Camera className="size-4" data-icon="inline-start" />
          )}
          {photoSrc ? 'Change farm photo' : 'Upload farm photo'}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </Panel>
  )
}

/* ------------------------------ security tab -------------------------------- */

function SecurityTab() {
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <Panel
      title="Change Password"
      description="Use at least 8 characters with a number"
      className="max-w-xl"
      bodyClassName="p-4"
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          const fd = new FormData(e.currentTarget)
          const currentPassword = fd.get('currentPassword') as string
          const newPassword = fd.get('newPassword') as string
          const confirmPassword = fd.get('confirmPassword') as string

          if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match.')
            return
          }

          setSaving(true)
          try {
            await authApi.changePassword({ currentPassword, newPassword })
            setSaved(true)
            e.currentTarget.reset()
            setTimeout(() => setSaved(false), 3000)
          } catch (err) {
            setError(err instanceof ApiClientError ? err.message : 'Could not change your password.')
          } finally {
            setSaving(false)
          }
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="c-current">Current password</FieldLabel>
            <Input id="c-current" name="currentPassword" type="password" required placeholder="********" />
          </Field>
          <Field>
            <FieldLabel htmlFor="c-new">New password</FieldLabel>
            <Input id="c-new" name="newPassword" type="password" required minLength={8} placeholder="********" />
          </Field>
          <Field>
            <FieldLabel htmlFor="c-confirm">Confirm new password</FieldLabel>
            <Input id="c-confirm" name="confirmPassword" type="password" required placeholder="********" />
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="bg-farmer text-background hover:bg-farmer/90"
            >
              {saving && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
              Update password
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-farmer">
                <Check className="size-3.5" aria-hidden />
                Password changed
              </span>
            )}
          </div>
        </FieldGroup>
      </form>
    </Panel>
  )
}

/* --------------------------- notifications tab ------------------------------ */

function NotificationsTab({
  user,
  refreshUser,
}: {
  user: ReturnType<typeof useAuth>['user']
  refreshUser: ReturnType<typeof useAuth>['refreshUser']
}) {
  const [savingKey, setSavingKey] = React.useState<PreferenceKey | null>(null)

  async function handleToggle(key: PreferenceKey, value: boolean) {
    setSavingKey(key)
    try {
      await farmerApi.updateProfile({ [key]: value })
      await refreshUser()
    } catch {
      // Re-sync to the server's actual value if the save failed.
      await refreshUser()
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <Panel
      title="Notification Preferences"
      description="Choose what WiMakit alerts you about"
      className="max-w-2xl"
      bodyClassName="divide-y divide-border"
    >
      {preferences.map((p) => {
        const checked = user?.[p.key] ?? (p.key !== 'notifyBroadcasts')
        return (
          <div key={p.key} className="flex items-start justify-between gap-4 px-4 py-3.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium">{p.label}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {p.description}
              </span>
            </div>
            <Switch
              checked={checked}
              disabled={savingKey === p.key}
              onCheckedChange={(value) => handleToggle(p.key, value)}
              aria-label={p.label}
            />
          </div>
        )
      })}
    </Panel>
  )
}
