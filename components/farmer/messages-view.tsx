'use client'

import * as React from 'react'
import { ArrowLeft, Check, CheckCheck, Lock, Paperclip, Send } from 'lucide-react'

import { farmerApi, type Conversation, type Message } from '@/lib/farmer/api'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function MessagesView() {
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [activeUserId, setActiveUserId] = React.useState<number | null>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [draft, setDraft] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    farmerApi
      .getConversations()
      .then((data) => {
        setConversations(data || [])
        if (data && data.length > 0) {
          setActiveUserId(data[0].otherUserId)
        }
      })
      .catch(() => setConversations([]))
  }, [])

  React.useEffect(() => {
    if (!activeUserId) return
    farmerApi
      .getConversation(activeUserId)
      .then((data) => setMessages(data || []))
      .catch(() => setMessages([]))
  }, [activeUserId])

  const activeConv = conversations.find((c) => c.otherUserId === activeUserId) || conversations[0]

  async function handleSend() {
    const text = draft.trim()
    if (!text || !activeUserId) return

    setLoading(true)
    try {
      const newMsg = await farmerApi.sendMessage(activeUserId, text)
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            senderId: 0,
            senderName: 'Me',
            receiverId: activeUserId,
            receiverName: activeConv?.otherUserName || 'User',
            content: text,
            sentAt: new Date().toISOString(),
            isRead: false,
          },
        ])
      }
      setDraft('')
    } catch {
      // Ignore error
    } finally {
      setLoading(false)
    }
  }

  const unreadTotal = conversations.reduce((n, c) => n + (c.unreadCount || 0), 0)

  return (
    <div className="flex h-[calc(100svh-13rem)] min-h-[520px] overflow-hidden rounded-lg border border-border bg-card">
      {/* Conversation list */}
      <div
        className={cn(
          'flex w-full shrink-0 flex-col border-r border-border md:w-[280px]',
          activeUserId && 'hidden md:flex',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-display text-sm">Conversations</span>
          <Badge variant="secondary" className="tabular">
            {unreadTotal} new
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            conversations.map((c) => {
              const initials = c.otherUserName
                ? c.otherUserName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'BY'
              return (
                <button
                  key={c.otherUserId}
                  type="button"
                  onClick={() => setActiveUserId(c.otherUserId)}
                  className={cn(
                    'flex w-full items-start gap-2.5 border-b border-border px-4 py-3 text-left transition-colors',
                    c.otherUserId === activeUserId ? 'bg-farmer/8' : 'hover:bg-secondary/60',
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-secondary text-[11px] text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.otherUserName}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.lastMessage || 'No messages yet'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">{c.otherUserRole || 'Buyer'}</span>
                      {(c.unreadCount || 0) > 0 && (
                        <span className="tabular rounded-full bg-farmer px-1.5 text-[10px] font-semibold text-background">
                          {c.unreadCount}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Active thread */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          !activeUserId && 'hidden md:flex',
        )}
      >
        {activeConv ? (
          <>
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Back to conversations"
                onClick={() => setActiveUserId(null)}
              >
                <ArrowLeft />
              </Button>
              <Avatar className="size-8">
                <AvatarFallback className="bg-secondary text-[11px] text-muted-foreground">
                  {activeConv.otherUserName
                    ? activeConv.otherUserName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'BY'}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{activeConv.otherUserName}</span>
                <span className="text-[11px] text-muted-foreground">{activeConv.otherUserRole || 'Buyer'}</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-background/40 p-4">
              {messages.length === 0 ? (
                <div className="my-auto text-center text-xs text-muted-foreground">
                  Send a message to start the conversation.
                </div>
              ) : (
                messages.map((m) => {
                  const fromMe = m.senderName !== activeConv.otherUserName
                  return (
                    <div
                      key={m.id}
                      className={cn('flex max-w-[80%] flex-col gap-1', fromMe && 'self-end')}
                    >
                      <div
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm leading-relaxed',
                          fromMe
                            ? 'border-farmer/30 bg-farmer/10 text-foreground'
                            : 'border-border bg-card',
                        )}
                      >
                        {m.content}
                      </div>
                      <span
                        className={cn(
                          'flex items-center gap-1 text-[11px] text-muted-foreground',
                          fromMe && 'justify-end',
                        )}
                      >
                        {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {fromMe &&
                          (m.isRead ? (
                            <CheckCheck className="size-3 text-farmer" aria-label="Read" />
                          ) : (
                            <Check className="size-3" aria-label="Sent" />
                          ))}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Attach image"
                >
                  <Paperclip />
                </Button>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeConv.otherUserName}…`}
                  aria-label="Message"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !draft.trim()}
                  className="bg-farmer text-background hover:bg-farmer/90"
                  aria-label="Send message"
                >
                  <Send />
                </Button>
              </form>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="size-3" aria-hidden />
                Contact info is never shared outside the platform.
              </p>
            </div>
          </>
        ) : (
          <div className="my-auto text-center text-sm text-muted-foreground">
            Select a conversation from the sidebar.
          </div>
        )}
      </div>
    </div>
  )
}


