'use client'

import * as React from 'react'
import * as signalR from '@microsoft/signalr'

import { API_BASE_URL } from '@/lib/api-client'
import { useAuth } from '@/components/providers/auth-provider'
import type { Message } from '@/lib/farmer/api'

// ─── Types ───────────────────────────────────────────────────────────────────
// Mirrors the mobile app's ChatContext event contract — see
// mobile/src/context/chat-context.tsx and backend Hubs/ChatHub.cs for the
// server-side broadcast contract this listens to.

export type ChatRealtimeEvent =
  | { type: 'received'; message: Message }
  | { type: 'edited'; message: Message }
  | { type: 'deleted'; message: Message }
  | { type: 'read'; messageIds: number[]; readerId: number; otherUserId: number }

type ChatEventListener = (event: ChatRealtimeEvent) => void

interface ChatHubContextType {
  /**
   * Subscribe to realtime message events pushed over the SignalR chat hub.
   * Returns an unsubscribe function.
   */
  subscribeToRealtime: (listener: ChatEventListener) => () => void
}

const ChatHubContext = React.createContext<ChatHubContextType | undefined>(undefined)

/**
 * Opens one SignalR connection per signed-in session (mirrors the mobile
 * ChatProvider) so the farmer web dashboard — sidebar unread badge and the
 * open conversation thread alike — updates live instead of only on refresh
 * or the next full page load.
 */
export function ChatHubProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth()
  const connectionRef = React.useRef<signalR.HubConnection | null>(null)
  const listenersRef = React.useRef<Set<ChatEventListener>>(new Set())

  const subscribeToRealtime = React.useCallback((listener: ChatEventListener) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  React.useEffect(() => {
    if (!token || !user) {
      connectionRef.current?.stop().catch(() => {})
      connectionRef.current = null
      return
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    const emit = (event: ChatRealtimeEvent) => {
      listenersRef.current.forEach((listener) => listener(event))
    }

    connection.on('ReceiveMessage', (message: Message) => emit({ type: 'received', message }))
    connection.on('MessageEdited', (message: Message) => emit({ type: 'edited', message }))
    connection.on('MessageDeleted', (message: Message) => emit({ type: 'deleted', message }))
    connection.on(
      'MessagesRead',
      (payload: { messageIds: number[]; readerId: number; otherUserId: number }) => {
        emit({ type: 'read', ...payload })
      },
    )

    connection.start().catch(() => {
      // Realtime is best-effort — the REST endpoints still work standalone, so
      // a failed/offline socket just falls back to manual refresh.
    })

    connectionRef.current = connection

    return () => {
      connection.stop().catch(() => {})
      connectionRef.current = null
    }
    // Deliberately depend on user?.id, not `user` — auth-provider hands back a
    // new user object on every profile refresh, which would otherwise tear
    // down and reopen the socket far more often than the identity actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id])

  return (
    <ChatHubContext.Provider value={{ subscribeToRealtime }}>{children}</ChatHubContext.Provider>
  )
}

export function useChatHub() {
  const ctx = React.useContext(ChatHubContext)
  if (!ctx) throw new Error('useChatHub must be used within a ChatHubProvider')
  return ctx
}
