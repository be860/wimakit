"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Loader2 } from "lucide-react"
import { messagesAPI, type ConversationData } from "@/lib/api"

export default function FarmerMessagesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "farmer")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true)
        const data = await messagesAPI.getConversations()
        setConversations(data)
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchConversations()
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with buyers about your produce</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground">Buyers will message you when interested in your produce</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Link key={conversation.userId} href={`/farmer/messages/${conversation.userId}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{conversation.userName}</h3>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-accent text-accent-foreground">{conversation.unreadCount} new</Badge>
                        )}
                      </div>
                      {conversation.produceName && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Regarding: <span className="text-primary">{conversation.produceName}</span>
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(conversation.lastMessageTime).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}