'use client'

import * as React from 'react'
import { Loader2, TriangleAlert } from 'lucide-react'

import { adminApi, type PlatformSettingsData } from '@/lib/admin/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldContent,
  FieldTitle,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, Panel } from '@/components/admin/primitives'

const DEFAULTS: PlatformSettingsData = {
  platformName: 'WiMakit',
  supportEmail: 'support@wimakit.sl',
  displayCurrency: 'sll',
  baseCommission: 3.5,
  payoutSchedule: 'weekly',
  manualReviewThreshold: 10_000_000,
  requireNinVerification: true,
  autoHoldHighValueOrders: true,
  requireTwoFactorForStaff: false,
}

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<PlatformSettingsData>(DEFAULTS)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    adminApi
      .getSettings()
      .then(setSettings)
      .catch((err: any) => setLoadError(err.data?.message || err.message || 'Could not load settings.'))
      .finally(() => setLoading(false))
  }, [])

  function update<K extends keyof PlatformSettingsData>(key: K, value: PlatformSettingsData[K]) {
    setSaved(false)
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      const updated = await adminApi.updateSettings(settings)
      setSettings(updated)
      setSaved(true)
    } catch (err: any) {
      setSaveError(err.data?.message || err.message || 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure platform-wide policies and defaults."
      >
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-farmer">Saved</span>}
          <Button size="sm" onClick={save} disabled={saving || loading}>
            {saving && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </PageHeader>

      {loadError && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <TriangleAlert />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      {saveError && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <TriangleAlert />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Platform" bodyClassName="p-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="platform-name">Platform name</FieldLabel>
              <Input
                id="platform-name"
                value={settings.platformName}
                onChange={(e) => update('platformName', e.target.value)}
                disabled={loading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="support-email">Support email</FieldLabel>
              <Input
                id="support-email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => update('supportEmail', e.target.value)}
                disabled={loading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="currency">Display currency</FieldLabel>
              <Select
                value={settings.displayCurrency}
                onValueChange={(v) => v && update('displayCurrency', v)}
                disabled={loading}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sll">Sierra Leonean Leone (Le)</SelectItem>
                  <SelectItem value="usd">US Dollar ($)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </Panel>

        <Panel title="Commission & Payouts" bodyClassName="p-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="base-commission">Base commission (%)</FieldLabel>
              <Input
                id="base-commission"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={settings.baseCommission}
                onChange={(e) => update('baseCommission', Number(e.target.value))}
                disabled={loading}
              />
              <FieldDescription>
                Default rate applied to categories without an override.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="payout-schedule">Payout schedule</FieldLabel>
              <Select
                value={settings.payoutSchedule}
                onValueChange={(v) => v && update('payoutSchedule', v)}
                disabled={loading}
              >
                <SelectTrigger id="payout-schedule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="threshold">Manual review threshold (Le)</FieldLabel>
              <Input
                id="threshold"
                type="number"
                min={0}
                value={settings.manualReviewThreshold}
                onChange={(e) => update('manualReviewThreshold', Number(e.target.value))}
                disabled={loading}
              />
            </Field>
          </FieldGroup>
        </Panel>
      </div>

      <Panel title="Policies" bodyClassName="p-4">
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Require NIN verification</FieldTitle>
              <FieldDescription>Farmers must verify their National ID before listing products.</FieldDescription>
            </FieldContent>
            <Switch
              checked={settings.requireNinVerification}
              onCheckedChange={(v) => update('requireNinVerification', v)}
              disabled={loading}
              aria-label="Require NIN verification"
            />
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Auto-hold high-value orders</FieldTitle>
              <FieldDescription>
                Hold escrow on orders above the manual review threshold for staff review.
              </FieldDescription>
            </FieldContent>
            <Switch
              checked={settings.autoHoldHighValueOrders}
              onCheckedChange={(v) => update('autoHoldHighValueOrders', v)}
              disabled={loading}
              aria-label="Auto-hold high-value orders"
            />
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Two-factor for staff logins</FieldTitle>
              <FieldDescription>Enforce 2FA for all SuperAdmin and Moderator accounts.</FieldDescription>
            </FieldContent>
            <Switch
              checked={settings.requireTwoFactorForStaff}
              onCheckedChange={(v) => update('requireTwoFactorForStaff', v)}
              disabled={loading}
              aria-label="Two-factor for staff logins"
            />
          </Field>
        </FieldGroup>
      </Panel>

      {settings.updatedAt && (
        <p className="text-xs text-muted-foreground">
          Last updated {new Date(settings.updatedAt).toLocaleString()}
          {settings.updatedBy ? ` by ${settings.updatedBy}` : ''}
        </p>
      )}
    </div>
  )
}
