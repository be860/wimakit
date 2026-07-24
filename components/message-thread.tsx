"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Message } from "@/lib/types"

interface MessageThreadProps {
  conversationId: string
  messages: Message[]
  otherPartyName: string
  onSendMessage: (content: string) => void
}

export function MessageThread({ conversationId, messages, otherPartyName, onSendMessage }: MessageThreadProps) {
  const { user } = useAuth()
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    await onSendMessage(newMessage.trim())
    setNewMessage("")
    setIsSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg">Chat with {otherPartyName}</CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isMyMessage = String(message.senderId) === String(user?.id)
              return (
                <div key={message.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${isMyMessage ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block rounded-lg px-4 py-2 ${
                        isMyMessage ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
            className="resize-none"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || isSending} className="px-4">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </Card>
  )
}
