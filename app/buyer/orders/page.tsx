"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { paymentAPI, type OrderData } from "@/lib/api"

export default function BuyerOrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "buyer")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const data = await paymentAPI.getBuyerHistory()
        setOrders(data)
      } catch (error) {
        console.error("Failed to fetch order history:", error)
      } finally {
        setIsLoading(false)
      }
    }
    if (user) fetchOrders()
  }, [user])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground">Manage your purchases and track your orders</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-4">You haven't purchased any produce yet</p>
            <Link href="/buyer/browse">
              <Button>Start Browsing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-40 h-40 bg-muted relative">
                    <img src={order.produceImageUrl || "/placeholder.svg"} alt={order.produceName} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-xl">{order.produceName}</h3>
                        <Badge className="bg-primary/10 text-primary border-primary/20">{order.status}</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        Farmer: <span className="font-medium text-foreground">{order.farmerName}</span>
                      </p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <span>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>Payment: {order.paymentMethod}</span>
                        <span>Order ID: #ORD-{order.id}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <p className="text-2xl font-black text-primary">Le {order.amount.toLocaleString()}</p>
                      <Link href={`/buyer/browse/${order.produceId}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          View Product <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}