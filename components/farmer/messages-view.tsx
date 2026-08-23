'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Lock,
  Mic,
  MoreVertical,
  Paperclip,
  Pencil,
  Send,
  Square,
  Trash2,
  X,
} from 'lucide-react'

import { farmerApi, type Conversation, type Message } from '@/lib/farmer/api'
import { getErrorMessage } from '@/lib/api-client'
import { useAuth } from '@/components/providers/auth-provider'
import { useChatHub } from '@/components/providers/chat-hub-provider'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function initialsFor(name: string | undefined) {
  return name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'BY'
}

export function MessagesView() {
  const { user } = useAuth()
  const { subscribeToRealtime } = useChatHub()
  const myUserId = user?.id ?? null

  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [activeUserId, setActiveUserId] = React.useState<number | null>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [draft, setDraft] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  // Edit state
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [editDraft, setEditDraft] = React.useState('')
  const [savingEdit, setSavingEdit] = React.useState(false)

  // Voice recording state
  const [recording, setRecording] = React.useState(false)
  const [recordingSeconds, setRecordingSeconds] = React.useState(0)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const recordingStreamRef = React.useRef<MediaStream | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])
  const recordingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Refetching the full conversation list (rather than patching entries in
  // place) after every realtime event keeps last-message previews, ordering
  // and unread counts exactly in sync with the server — same approach as the
  // mobile app's messages screen.
  // The chat hub echoes a sent message back to the sender's own connection
  // too (it's pushed to both participants' groups), and that push can win
  // the race against the REST response below — dedup by id so a message we
  // just sent doesn't render twice.
  const appendMessage = React.useCallback((msg: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
  }, [])

  const loadConversations = React.useCallback(() => {
    return farmerApi
      .getConversations()
      .then((data) => {
        setConversations(data || [])
        return data || []
      })
      .catch(() => {
        setConversations([])
        return []
      })
  }, [])

  React.useEffect(() => {
    loadConversations().then((data) => {
      if (data.length > 0) setActiveUserId(data[0].userId)
    })
  }, [loadConversations])

  // Live updates pushed over the SignalR chat hub. `messages` only ever holds
  // the currently open thread, so edit/delete/read updates can just map over
  // it by id — a no-op for events belonging to some other conversation.
  React.useEffect(() => {
    return subscribeToRealtime((event) => {
      if (event.type === 'received') {
        const msg = event.message
        const belongsToOpenThread =
          activeUserId != null && (msg.senderId === activeUserId || msg.receiverId === activeUserId)

        if (belongsToOpenThread) {
          appendMessage(msg)
          if (msg.senderId === activeUserId && msg.receiverId === myUserId) {
            farmerApi.markMessageRead(msg.id).catch(() => {})
          }
        }
        loadConversations()
        return
      }

      if (event.type === 'edited' || event.type === 'deleted') {
        const msg = event.message
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)))
        loadConversations()
        return
      }

      if (event.type === 'read') {
        // Flip read receipts for messages in the open thread.
        setMessages((prev) =>
          prev.map((m) => (event.messageIds.includes(m.id) ? { ...m, isRead: true } : m)),
        )
      }
      // Other event types (orders, notifications) are handled elsewhere.
    })
  }, [activeUserId, myUserId, subscribeToRealtime, loadConversations, appendMessage])

  React.useEffect(() => {
    if (!activeUserId) return
    farmerApi
      .getConversation(activeUserId)
      .then((data) => {
        setMessages(data || [])
        // Mark any unread messages from this other user as read, and clear
        // the unread badge for this conversation in the sidebar.
        const unread = (data || []).filter((m) => !m.isRead && m.senderId === activeUserId)
        unread.forEach((m) => {
          farmerApi.markMessageRead(m.id).catch(() => {})
        })
        setConversations((prev) =>
          prev.map((c) => (c.userId === activeUserId ? { ...c, unreadCount: 0 } : c)),
        )
      })
      .catch(() => setMessages([]))
  }, [activeUserId])

  // Stop any in-progress recording if the user navigates away.
  React.useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      recordingStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const activeConv = conversations.find((c) => c.userId === activeUserId) || conversations[0]

  async function handleSend() {
    const text = draft.trim()
    if (!text || !activeUserId) return

    setLoading(true)
    try {
      const newMsg = await farmerApi.sendMessage(activeUserId, { content: text })
      if (newMsg) {
        appendMessage(newMsg)
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            senderId: 0,
            senderName: 'Me',
            receiverId: activeUserId,
            receiverName: activeConv?.userName || 'User',
            content: text,
            messageType: 'text',
            isEdited: false,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            isRead: false,
          },
        ])
      }
      setDraft('')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not send your message. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // ─── Image attachments ──────────────────────────────────────────────────

  function handleAttachClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !activeUserId) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please select a JPG, PNG, or WEBP image.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image must be smaller than 5MB.')
      return
    }

    setUploading(true)
    try {
      const uploaded = await farmerApi.uploadMessageAttachment(file)
      const newMsg = await farmerApi.sendMessage(activeUserId, {
        messageType: 'image',
        attachmentUrl: uploaded.url,
      })
      appendMessage(newMsg)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not send the image. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  // ─── Voice messages ─────────────────────────────────────────────────────

  async function startRecording() {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toast.error('Voice messages are not supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recordingStreamRef.current = stream
      const preferredType = ['audio/webm', 'audio/mp4', 'audio/ogg'].find(
        (t) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t),
      )
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined)
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
      setRecordingSeconds(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1)
      }, 1000)
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          'Microphone access was denied. Please allow microphone access to record a voice message.',
        ),
      )
    }
  }

  function stopRecording(send: boolean) {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    const duration = recordingSeconds

    recorder.onstop = () => {
      recordingStreamRef.current?.getTracks().forEach((t) => t.stop())
      recordingStreamRef.current = null
      if (send && duration > 0) {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        audioChunksRef.current = []
        void sendVoiceMessage(blob, duration)
      } else {
        audioChunksRef.current = []
      }
    }
    recorder.stop()
    mediaRecorderRef.current = null
    setRecording(false)
    setRecordingSeconds(0)
  }

  async function sendVoiceMessage(blob: Blob, durationSeconds: number) {
    if (!activeUserId) return
    setUploading(true)
    try {
      const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'
      const file = new File([blob], `voice-message.${ext}`, { type: blob.type || 'audio/webm' })
      const uploaded = await farmerApi.uploadMessageAttachment(file)
      const newMsg = await farmerApi.sendMessage(activeUserId, {
        messageType: 'voice',
        attachmentUrl: uploaded.url,
        attachmentDurationSeconds: Math.max(1, Math.round(durationSeconds)),
      })
      appendMessage(newMsg)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not send the voice message. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  // ─── Edit / delete ──────────────────────────────────────────────────────

  function startEdit(message: Message) {
    setEditingId(message.id)
    setEditDraft(message.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft('')
  }

  async function saveEdit() {
    const text = editDraft.trim()
    if (!text || editingId == null) return
    setSavingEdit(true)
    try {
      const updated = await farmerApi.editMessage(editingId, text)
      setMessages((prev) => prev.map((m) => (m.id === editingId ? updated : m)))
      setEditingId(null)
      setEditDraft('')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save your edit. Please try again.'))
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(message: Message) {
    if (!window.confirm('Delete this message? This cannot be undone.')) return
    try {
      await farmerApi.deleteMessage(message.id)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id
            ? { ...m, isDeleted: true, content: '', attachmentUrl: undefined, attachmentDurationSeconds: undefined }
            : m,
        ),
      )
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete the message. Please try again.'))
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
              const initials = initialsFor(c.userName)
              return (
                <button
                  key={c.userId}
                  type="button"
                  onClick={() => setActiveUserId(c.userId)}
                  className={cn(
                    'flex w-full items-start gap-2.5 border-b border-border px-4 py-3 text-left transition-colors',
                    c.userId === activeUserId ? 'bg-farmer/8' : 'hover:bg-secondary/60',
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    {c.userProfilePhotoUrl && <AvatarImage src={c.userProfilePhotoUrl} alt={c.userName} />}
                    <AvatarFallback className="bg-secondary text-[11px] text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.userName}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.lastMessage || 'No messages yet'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">{c.userRole || 'Buyer'}</span>
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
                {activeConv.userProfilePhotoUrl && (
                  <AvatarImage src={activeConv.userProfilePhotoUrl} alt={activeConv.userName} />
                )}
                <AvatarFallback className="bg-secondary text-[11px] text-muted-foreground">
                  {initialsFor(activeConv.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{activeConv.userName}</span>
                <span className="text-[11px] text-muted-foreground">{activeConv.userRole || 'Buyer'}</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-background/40 p-4">
              {messages.length === 0 ? (
                <div className="my-auto text-center text-xs text-muted-foreground">
                  Send a message to start the conversation.
                </div>
              ) : (
                messages.map((m) => {
                  const fromMe = m.senderName !== activeConv.userName
                  const isEditingThis = editingId === m.id
                  const canEdit = fromMe && !m.isDeleted && m.messageType === 'text'
                  const canDelete = fromMe && !m.isDeleted
                  return (
                    <div
                      key={m.id}
                      className={cn('group flex max-w-[80%] flex-col gap-1', fromMe && 'self-end')}
                    >
                      <div className={cn('flex items-center gap-1', fromMe && 'flex-row-reverse')}>
                        {(canEdit || canDelete) && !isEditingThis && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-6 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                                  aria-label="Message actions"
                                >
                                  <MoreVertical className="size-3.5" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align={fromMe ? 'end' : 'start'}>
                              {canEdit && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => startEdit(m)}>
                                  <Pencil className="size-3.5" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  className="cursor-pointer"
                                  onClick={() => handleDelete(m)}
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <div
                          className={cn(
                            'min-w-0 rounded-lg border px-3 py-2 text-sm leading-relaxed',
                            fromMe
                              ? 'border-farmer/30 bg-farmer/10 text-foreground'
                              : 'border-border bg-card',
                            m.isDeleted && 'italic text-muted-foreground',
                          )}
                        >
                          {m.isDeleted ? (
                            'This message was deleted'
                          ) : isEditingThis ? (
                            <div className="flex flex-col gap-1.5">
                              <Input
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                className="h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    saveEdit()
                                  } else if (e.key === 'Escape') {
                                    cancelEdit()
                                  }
                                }}
                              />
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  className="h-6 bg-farmer px-2 text-xs text-background hover:bg-farmer/90"
                                  disabled={savingEdit || !editDraft.trim()}
                                  onClick={saveEdit}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  disabled={savingEdit}
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : m.messageType === 'voice' ? (
                            <div className="flex items-center gap-2">
                              <audio controls src={m.attachmentUrl} className="h-8 max-w-[220px]" />
                              {typeof m.attachmentDurationSeconds === 'number' && (
                                <span className="tabular shrink-0 text-[11px] text-muted-foreground">
                                  {formatDuration(m.attachmentDurationSeconds)}
                                </span>
                              )}
                            </div>
                          ) : m.messageType === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.attachmentUrl}
                              alt="Attachment"
                              className="max-h-[220px] max-w-[220px] rounded-md object-cover"
                            />
                          ) : (
                            m.content
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'flex items-center gap-1 text-[11px] text-muted-foreground',
                          fromMe && 'justify-end',
                        )}
                      >
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {!m.isDeleted && m.isEdited && <span>(edited)</span>}
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelected}
              />
              {recording ? (
                <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                  <span className="relative flex size-2.5 shrink-0">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
                  </span>
                  <span className="tabular flex-1 text-sm text-foreground">
                    Recording… {formatDuration(recordingSeconds)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Cancel recording"
                    onClick={() => stopRecording(false)}
                  >
                    <X />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    className="bg-farmer text-background hover:bg-farmer/90"
                    aria-label="Stop and send recording"
                    onClick={() => stopRecording(true)}
                  >
                    <Square className="size-3.5" />
                  </Button>
                </div>
              ) : (
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
                    disabled={uploading}
                    onClick={handleAttachClick}
                  >
                    <Paperclip />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Record voice message"
                    disabled={uploading}
                    onClick={startRecording}
                  >
                    <Mic />
                  </Button>
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${activeConv.userName}…`}
                    aria-label="Message"
                    disabled={loading || uploading}
                  />
                  <Button
                    type="submit"
                    disabled={loading || uploading || !draft.trim()}
                    className="bg-farmer text-background hover:bg-farmer/90"
                    aria-label="Send message"
                  >
                    <Send />
                  </Button>
                </form>
              )}
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
