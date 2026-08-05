'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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

const toggles = [
  {
    title: 'Require NIN verification',
    description: 'Farmers must verify their National ID before listing products.',
    defaultChecked: true,
  },
  {
    title: 'Auto-hold high-value orders',
    description: 'Hold escrow on orders above Le 10,000,000 for manual review.',
    defaultChecked: true,
  },
  {
    title: 'Two-factor for staff logins',
    description: 'Enforce 2FA for all SuperAdmin and Moderator accounts.',
    defaultChecked: false,
  },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure platform-wide policies and defaults."
      >
        <Button size="sm">Save changes</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Platform" bodyClassName="p-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="platform-name">Platform name</FieldLabel>
              <Input id="platform-name" defaultValue="WiMakit" />
            </Field>
            <Field>
              <FieldLabel htmlFor="support-email">Support email</FieldLabel>
              <Input
                id="support-email"
                type="email"
                defaultValue="support@wimakit.sl"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="currency">Display currency</FieldLabel>
              <Select defaultValue="sll">
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
              <Input id="base-commission" type="number" defaultValue="3.5" />
              <FieldDescription>
                Default rate applied to categories without an override.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="payout-schedule">Payout schedule</FieldLabel>
              <Select defaultValue="weekly">
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
              <Input id="threshold" type="number" defaultValue="10000000" />
            </Field>
          </FieldGroup>
        </Panel>
      </div>

      <Panel title="Policies" bodyClassName="p-4">
        <FieldGroup>
          {toggles.map((t) => (
            <Field key={t.title} orientation="horizontal">
              <FieldContent>
                <FieldTitle>{t.title}</FieldTitle>
                <FieldDescription>{t.description}</FieldDescription>
              </FieldContent>
              <Switch defaultChecked={t.defaultChecked} aria-label={t.title} />
            </Field>
          ))}
        </FieldGroup>
      </Panel>
    </div>
  )
}
