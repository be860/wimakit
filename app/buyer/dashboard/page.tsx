"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BuyerNav } from "@/components/buyer-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, MessageSquare, Search, MapPin, ShoppingBag, DollarSign } from "lucide-react"
import Link from "next/link"
import { produceAPI, messagesAPI, paymentAPI, type ProduceData, type ConversationData, type OrderData } from "@/lib/api"

export default function BuyerDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [availableProduce, setAvailableProduce] = useState<ProduceData[]>([])
  const [myConversations, setMyConversations] = useState<ConversationData[]>([])
  const [myOrders, setMyOrders] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "buyer")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const [produceData, convData, ordersData] = await Promise.all([
          produceAPI.getAll(),
          messagesAPI.getConversations(),
          paymentAPI.getBuyerHistory(),
        ])
        setAvailableProduce(produceData)
        setMyConversations(convData)
        setMyOrders(ordersData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (authLoading || (isLoading && !user)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const unreadMessages = myConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  const totalSpent = myOrders.reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <BuyerNav />

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Discover fresh produce from local farmers.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Produce</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{availableProduce.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Products ready to purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{myConversations.length}</div>
              {unreadMessages > 0 && <p className="text-xs text-accent mt-1">{unreadMessages} unread message(s)</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">Le {totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">On fresh produce</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/buyer/browse">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Browse Produce</h3>
                    <p className="text-sm text-muted-foreground">Find fresh products from farmers</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/buyer/messages">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">View Messages</h3>
                    <p className="text-sm text-muted-foreground">Chat with farmers</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Market Insights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {availableProduce.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      availableProduce.reduce((acc: Record<string, number>, p) => {
                        acc[p.category] = (acc[p.category] || 0) + 1
                        return acc
                      }, {})
                    )
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, count]) => {
                        const percentage = (count / availableProduce.length) * 100
                        return (
                          <div key={category}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground font-medium">{category}</span>
                              <span className="text-muted-foreground">{count} products</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No products available yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Price Range Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price Range Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {availableProduce.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Lowest Price</span>
                      <span className="text-lg font-bold text-green-600">
                        Le {Math.min(...availableProduce.map((p) => p.price)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Average Price</span>
                      <span className="text-lg font-bold text-primary">
                        Le{" "}
                        {Math.round(
                          availableProduce.reduce((sum, p) => sum + p.price, 0) / availableProduce.length
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Highest Price</span>
                      <span className="text-lg font-bold text-orange-600">
                        Le {Math.max(...availableProduce.map((p) => p.price)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No products available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Produce */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Featured Produce</h2>
            <Link href="/buyer/browse">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-12">Loading produce...</div>
          ) : availableProduce.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No produce available at the moment.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProduce.slice(0, 6).map((produce) => (
                <Card key={produce.id}>
                  <CardContent className="p-0">
                    <div className="aspect-video relative rounded-t-lg overflow-hidden bg-muted">
                      <img
                        src={produce.imageUrl || "/placeholder.svg"}
                        alt={produce.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground text-lg mb-1">{produce.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{produce.category}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xl font-bold text-primary">
                            Le {produce.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">/{produce.unit}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {produce.quantity} {produce.unit}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{produce.location || produce.farmerLocation}</span>
                        </div>
                      </div>
                      <Link href={`/buyer/browse/${produce.id}`}>
                        <Button className="w-full" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
