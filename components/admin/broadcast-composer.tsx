'use client'

import * as React from 'react'
import { Send } from 'lucide-react'

import { adminApi, NotificationItem } from '@/lib/admin/api'
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

interface Props {
  onSent?: (item: NotificationItem) => void
}

export function BroadcastComposer({ onSent }: Props) {
  const [title, setTitle] = React.useState('')
  const [body, setBody] = React.useState('')
  const [targetRole, setTargetRole] = React.useState('all')
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const remaining = 160 - body.length

  async function handleSend() {
    if (!title.trim() || !body.trim()) return
    setSending(true)
    try {
      await adminApi.broadcastNotification(title, body, targetRole === 'all' ? undefined : targetRole)
      const fakeItem: NotificationItem = {
        id: Date.now(),
        type: 'broadcast',
        title,
        body,
        isUnread: false,
        createdAt: new Date().toISOString(),
      }
      onSent?.(fakeItem)
      setTitle('')
      setBody('')
      setTargetRole('all')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch {
      // TODO: show error toast
    } finally {
      setSending(false)
    }
  }

  return (
    <Panel title="Compose Broadcast" bodyClassName="p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="subject">Subject / Title</FieldLabel>
          <Input
            id="subject"
            placeholder="e.g. Rice harvest window opens Monday"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="audience">Audience</FieldLabel>
            <Select
              value={targetRole}
              onValueChange={(v) => setTargetRole(v as string)}
              items={{
                all: 'All users',
                farmer: 'Farmers',
                buyer: 'Buyers',
              }}
            >
              <SelectTrigger id="audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="farmer">Farmers</SelectItem>
                <SelectItem value="buyer">Buyers</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="channel">Channel</FieldLabel>
            <Select
              defaultValue="inapp"
              items={{
                inapp: 'In-app',
              }}
            >
              <SelectTrigger id="channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inapp">In-app</SelectItem>
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
            placeholder="Keep it short and clear."
          />
          <FieldDescription>{remaining} characters remaining</FieldDescription>
        </Field>
        <div className="flex items-center justify-end gap-2">
          {sent && (
            <span className="text-sm text-green-600 font-medium">Broadcast sent!</span>
          )}
          <Button
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
          >
            <Send data-icon="inline-start" />
            {sending ? 'Sending…' : 'Send broadcast'}
          </Button>
        </div>
      </FieldGroup>
    </Panel>
  )
}
