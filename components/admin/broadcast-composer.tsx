'use client'

import * as React from 'react'
import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Panel } from '@/components/admin/primitives'

export function BroadcastComposer() {
  const [body, setBody] = React.useState('')
  const remaining = 160 - body.length

  return (
    <Panel title="Compose Broadcast" bodyClassName="p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="subject">Subject</FieldLabel>
          <Input id="subject" placeholder="e.g. Rice harvest window opens Monday" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="audience">Audience</FieldLabel>
            <Select
              defaultValue="approved-farmers"
              items={{
                all: 'All users',
                'approved-farmers': 'Approved farmers',
                'unverified-farmers': 'Unverified farmers',
                buyers: 'All buyers',
              }}
            >
              <SelectTrigger id="audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="approved-farmers">Approved farmers</SelectItem>
                <SelectItem value="unverified-farmers">Unverified farmers</SelectItem>
                <SelectItem value="buyers">All buyers</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="channel">Channel</FieldLabel>
            <Select
              defaultValue="sms-inapp"
              items={{
                sms: 'SMS',
                inapp: 'In-app',
                'sms-inapp': 'SMS + In-app',
              }}
            >
              <SelectTrigger id="channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="inapp">In-app</SelectItem>
                <SelectItem value="sms-inapp">SMS + In-app</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <Textarea
            id="message"
            rows={4}
            maxLength={160}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Keep it short — SMS recipients see the first 160 characters."
          />
          <FieldDescription>{remaining} characters remaining</FieldDescription>
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Save draft</Button>
          <Button>
            <Send data-icon="inline-start" />
            Send broadcast
          </Button>
        </div>
      </FieldGroup>
    </Panel>
  )
}
