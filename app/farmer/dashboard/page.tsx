"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { FarmerNav } from "@/components/farmer-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, MessageSquare, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { produceAPI, messagesAPI, paymentAPI, type ProduceData, type ConversationData, type OrderData } from "@/lib/api"

export default function FarmerDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [myProduce, setMyProduce] = useState<ProduceData[]>([])
  const [myConversations, setMyConversations] = useState<ConversationData[]>([])
  const [mySales, setMySales] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "farmer")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const [produceData, convData, salesData] = await Promise.all([
          produceAPI.getByFarmer(user.id),
          messagesAPI.getConversations(),
          paymentAPI.getFarmerSales(),
        ])
        setMyProduce(produceData)
        setMyConversations(convData)
        setMySales(salesData)
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

  const activeListings = myProduce.filter((p) => p.status === "available").length
  const unreadMessages = myConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  const totalEarnings = mySales.reduce((sum, s) => sum + s.amount, 0)
  const inventoryValue = myProduce.reduce((sum, p) => sum + p.price * p.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your farm today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{activeListings}</div>
              <p className="text-xs text-muted-foreground mt-1">Products available for sale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{myConversations.length}</div>
              {unreadMessages > 0 && <p className="text-xs text-accent mt-1">{unreadMessages} unread message(s)</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">Le {totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">From successful sales</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/farmer/produce/new">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Add New Produce</h3>
                    <p className="text-sm text-muted-foreground">List new items for sale</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/farmer/messages">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">View Messages</h3>
                    <p className="text-sm text-muted-foreground">Connect with buyers</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Analytics Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {myProduce.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      myProduce.reduce((acc: Record<string, number>, p) => {
                        acc[p.category] = (acc[p.category] || 0) + 1
                        return acc
                      }, {})
                    ).map(([category, count]) => {
                      const percentage = (count / myProduce.length) * 100
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground font-medium">{category}</span>
                            <span className="text-muted-foreground">{count} items</span>
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
                    No data available. Add produce to see analytics.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Top Products by Value */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Products by Value</CardTitle>
              </CardHeader>
              <CardContent>
                {myProduce.length > 0 ? (
                  <div className="space-y-3">
                    {myProduce
                      .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
                      .slice(0, 5)
                      .map((produce) => {
                        const value = produce.price * produce.quantity
                        return (
                          <div key={produce.id} className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{produce.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {produce.quantity} {produce.unit} × Le {produce.price.toLocaleString()}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-primary">
                              Le {value.toLocaleString()}
                            </span>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No data available. Add produce to see analytics.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Produce */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">My Recent Produce</h2>
            <Link href="/farmer/produce">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-12">Loading produce...</div>
          ) : myProduce.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No produce listed yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start by adding your first product</p>
                <Link href="/farmer/produce/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Produce
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProduce.slice(0, 3).map((produce) => (
                <Card key={produce.id}>
                  <CardContent className="p-4">
                    <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={produce.imageUrl || "/placeholder.svg"}
                        alt={produce.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{produce.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{produce.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        Le {produce.price.toLocaleString()}/{produce.unit}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {produce.quantity} {produce.unit}
                      </span>
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
