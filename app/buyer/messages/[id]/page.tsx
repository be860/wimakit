"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BuyerNav } from "@/components/buyer-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { messagesAPI, type MessageData } from "@/lib/api"
import { MessageThread } from "@/components/message-thread"

export default function BuyerConversationPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "buyer")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchMessages = async () => {
      const otherUserId = typeof params.id === "string" ? Number.parseInt(params.id) : 0
      if (!otherUserId) return

      try {
        setIsLoading(true)
        const data = await messagesAPI.getConversation(otherUserId)
        setMessages(data)
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && params.id) {
      fetchMessages()
    }
  }, [user, params.id])

  if (authLoading || (isLoading && !messages.length)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const otherParticipant = messages.length > 0
    ? (messages[0].senderId === user?.id ? messages[0].receiverName : messages[0].senderName)
    : "Farmer"

  const handleSendMessage = async (content: string) => {
    const otherUserId = typeof params.id === "string" ? Number.parseInt(params.id) : 0
    if (!otherUserId) return

    try {
      const newMessage = await messagesAPI.send({
        receiverId: otherUserId,
        content,
      })
      setMessages((prev: any[]) => [...prev, newMessage])
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BuyerNav />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/buyer/messages">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Button>
        </Link>

        {messages.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="font-semibold text-foreground mb-2">Conversation not found</h3>
              <Link href="/buyer/messages">
                <Button variant="link">Back to Messages</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <MessageThread
            conversationId={params.id as string}
            messages={messages.map(m => ({
              id: m.id.toString(),
              conversationId: params.id as string,
              senderId: m.senderId.toString(),
              senderName: m.senderName,
              senderRole: m.senderId === user?.id ? "buyer" : "farmer",
              receiverId: m.receiverId.toString(),
              content: m.content,
              timestamp: m.createdAt,
              read: m.isRead
            }))}
            otherPartyName={otherParticipant}
            onSendMessage={handleSendMessage}
          />
        )}
      </main>
    </div>
  )
}
