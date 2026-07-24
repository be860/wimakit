"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BuyerNav } from "@/components/buyer-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Package, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { produceAPI, messagesAPI, type ProduceData } from "@/lib/api"
import { PaymentModal } from "@/components/payment-modal"

export default function ProduceDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [produce, setProduce] = useState<ProduceData | null>(null)
  const [message, setMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "buyer")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchProduce = async () => {
      const id = typeof params.id === "string" ? Number.parseInt(params.id) : 0
      if (!id) return

      try {
        setIsLoading(true)
        const data = await produceAPI.getById(id)
        setProduce(data)
      } catch (error) {
        console.error("Failed to fetch produce details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && params.id) {
      fetchProduce()
    }
  }, [user, params.id])

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!produce) {
    return (
      <div className="min-h-screen bg-background">
        <BuyerNav />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="font-semibold text-foreground mb-2">Produce not found</h3>
              <Link href="/buyer/browse">
                <Button variant="link">Back to Browse</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsSending(true)
    try {
      await messagesAPI.send({
        receiverId: produce.farmerId,
        produceId: produce.id,
        content: message,
      })

      setIsDialogOpen(false)
      setMessage("")
      router.push(`/buyer/messages/${produce.farmerId}`)
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BuyerNav />

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
        <Link href="/buyer/browse">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted mb-4">
              <img
                src={produce.imageUrl || "/placeholder.svg"}
                alt={produce.name}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <Badge className="mb-2">{produce.category}</Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">{produce.name}</h1>
              <p className="text-primary font-medium">Sold by {produce.farmerName}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-primary">Le {produce.price.toLocaleString()}</span>
                <span className="text-xl text-muted-foreground">per {produce.unit}</span>
              </div>
              <p className="text-lg text-muted-foreground">
                <Package className="h-4 w-4 inline mr-2" />
                {produce.quantity} {produce.unit} available
              </p>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">{produce.location || produce.farmerLocation}</p>
                  </div>
                </div>
                {/* Farmer contact info might be hidden or shown via direct message */}
              </CardContent>
            </Card>

            <div className="mb-6">
              <h2 className="font-semibold text-foreground mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{produce.description}</p>
            </div>

            <div className="mb-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p>Listed on: {new Date(produce.createdAt).toLocaleDateString()}</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-2" size="lg">
                  Contact Farmer
                </Button>
              </DialogTrigger>
              <Button onClick={() => setIsPaymentModalOpen(true)} className="w-full" size="lg">
                Buy Now
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Message to {produce.farmerName}</DialogTitle>
                  <DialogDescription>
                    Introduce yourself and ask about {produce.name}. The farmer will respond to your inquiry.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="Hi, I'm interested in purchasing your produce. Is it still available?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSendMessage} disabled={!message.trim() || isSending} className="flex-1">
                      {isSending ? "Sending..." : "Send Message"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSending}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <PaymentModal
              open={isPaymentModalOpen}
              onOpenChange={setIsPaymentModalOpen}
              produceId={produce.id}
              produceName={produce.name}
              amount={produce.price}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
