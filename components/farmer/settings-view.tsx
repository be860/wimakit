'use client'

import * as React from 'react'
import { Check, FileCheck2, Upload } from 'lucide-react'

import { useAuth } from '@/components/providers/auth-provider'
import { farmerApi } from '@/lib/farmer/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
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

const documents = [
  { key: 'profile', label: 'Profile Photo' },
  { key: 'id-front', label: 'National ID (Front)' },
  { key: 'id-back', label: 'National ID (Back)' },
  { key: 'farm', label: 'Farm Photo' },
]

const preferences = [
  { key: 'orders', label: 'New orders', description: 'Alert me when a buyer places an order.' },
  { key: 'approvals', label: 'Listing approvals', description: 'Tell me when a product is approved or rejected.' },
  { key: 'messages', label: 'Messages', description: 'Notify me about new buyer messages.' },
  { key: 'broadcasts', label: 'Platform broadcasts', description: 'Advisories and notices from WiMakit.' },
]

export function SettingsView() {
  const { user } = useAuth()
  const [crops, setCrops] = React.useState<string[]>([])
  const [saved, setSaved] = React.useState(false)
  const [uploaded, setUploaded] = React.useState<Record<string, boolean>>({
    profile: true,
    'id-front': true,
    'id-back': true,
    farm: true,
  })
  const [pwSaved, setPwSaved] = React.useState(false)

  return (
    <Tabs defaultValue="profile" className="gap-4">
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="farm">Farm details</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      {/* ------------------------------ profile ------------------------------ */}
      <TabsContent value="profile">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel
            title="Personal Information"
            description="Shown to WiMakit staff only — never to buyers"
            className="xl:col-span-2"
            bodyClassName="p-4"
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                try {
                  await farmerApi.updateProfile({
                    firstName: (fd.get('firstName') as string) || user?.firstName || '',
                    lastName: (fd.get('lastName') as string) || user?.lastName || '',
                    email: (fd.get('email') as string) || user?.email || '',
                    phone: (fd.get('phone') as string) || '',
                    district: (fd.get('district') as string) || '',
                    chiefdom: (fd.get('chiefdom') as string) || '',
                    community: (fd.get('community') as string) || '',
                  })
                  setSaved(true)
                  setTimeout(() => setSaved(false), 3000)
                } catch {
                  // Silently fail
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
                    <Input id="s-email" name="email" type="email" defaultValue={user?.email || ''} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="s-phone">Phone Number</FieldLabel>
                    <Input id="s-phone" name="phone" defaultValue={(user as any)?.phone || (user as any)?.phoneNumber || ''} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="s-district">District</FieldLabel>
                    <Select name="district" defaultValue={user?.district || SIERRA_LEONE_DISTRICTS[0]}>
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
                    <Input id="s-chiefdom" name="chiefdom" defaultValue={(user as any)?.chiefdom || ''} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="s-community">Community</FieldLabel>
                    <Input id="s-community" name="community" defaultValue={(user as any)?.community || ''} />
                  </Field>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    className="bg-farmer text-background hover:bg-farmer/90"
                  >
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
              <VerificationBadge status={(user as any)?.verificationStatus || 'Pending'} />
              <dl className="flex flex-col gap-2 text-sm">
                {[
                  ['Registered', user ? new Date((user as any).createdAt || Date.now()).toLocaleDateString() : '—'],
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
              {documents.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() =>
                    setUploaded((prev) => ({ ...prev, [d.key]: true }))
                  }
                  className={cn(
                    'flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-left text-sm transition-colors',
                    uploaded[d.key]
                      ? 'border-farmer/30 bg-farmer/8 text-foreground'
                      : 'bg-secondary/40 text-muted-foreground hover:bg-secondary',
                  )}
                >
                  {uploaded[d.key] ? (
                    <FileCheck2 className="size-4 shrink-0 text-farmer" aria-hidden />
                  ) : (
                    <Upload className="size-4 shrink-0" aria-hidden />
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{d.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {uploaded[d.key] ? 'Uploaded · verified' : 'Click to upload'}
                    </span>
                  </span>
                </button>
              ))}
            </Panel>
          </div>
        </div>
      </TabsContent>

      {/* ------------------------------- farm ------------------------------- */}
      <TabsContent value="farm">
        <Panel
          title="Farm Details"
          description="What buyers see on your public seller profile"
          bodyClassName="p-4"
        >
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="f-name">Farm Name</FieldLabel>
                <Input id="f-name" defaultValue={(user as any)?.farmName || ''} />
              </Field>
              <Field>
                <FieldLabel htmlFor="f-size">Farm Size</FieldLabel>
                <Input id="f-size" defaultValue={(user as any)?.farmSize || ''} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="f-address">Farm Address</FieldLabel>
              <Input id="f-address" defaultValue={(user as any)?.farmAddress || ''} />
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
                rows={4}
                defaultValue={(user as any)?.bio || ''}
              />
            </Field>
            <Button className="w-fit bg-farmer text-background hover:bg-farmer/90">
              Save farm details
            </Button>
          </FieldGroup>
        </Panel>
      </TabsContent>

      {/* ----------------------------- security ----------------------------- */}
      <TabsContent value="security">
        <Panel
          title="Change Password"
          description="Use at least 8 characters with a number"
          className="max-w-xl"
          bodyClassName="p-4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setPwSaved(true)
              setTimeout(() => setPwSaved(false), 3000)
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="c-current">Current password</FieldLabel>
                <Input id="c-current" type="password" required placeholder="••••••••" />
              </Field>
              <Field>
                <FieldLabel htmlFor="c-new">New password</FieldLabel>
                <Input id="c-new" type="password" required placeholder="••••••••" />
              </Field>
              <Field>
                <FieldLabel htmlFor="c-confirm">Confirm new password</FieldLabel>
                <Input id="c-confirm" type="password" required placeholder="••••••••" />
              </Field>
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  className="bg-farmer text-background hover:bg-farmer/90"
                >
                  Update password
                </Button>
                {pwSaved && (
                  <span className="flex items-center gap-1.5 text-xs text-farmer">
                    <Check className="size-3.5" aria-hidden />
                    Password changed
                  </span>
                )}
              </div>
            </FieldGroup>
          </form>
        </Panel>
      </TabsContent>

      {/* --------------------------- notifications -------------------------- */}
      <TabsContent value="notifications">
        <Panel
          title="Notification Preferences"
          description="Choose what WiMakit alerts you about"
          className="max-w-2xl"
          bodyClassName="divide-y divide-border"
        >
          {preferences.map((p, i) => (
            <div key={p.key} className="flex items-start justify-between gap-4 px-4 py-3.5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium">{p.label}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {p.description}
                </span>
              </div>
              <Switch defaultChecked={i !== 3} aria-label={p.label} />
            </div>
          ))}
        </Panel>
      </TabsContent>
    </Tabs>
  )
}

