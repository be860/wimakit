"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, MessageSquare, Search, MapPin, ShoppingBag, ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react"
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
    if (user) fetchDashboardData()
  }, [user])

  if (authLoading || (isLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F2E9" }}>
        <div className="h-10 w-10 rounded-full border-3 border-[#1E3A5F]/30 border-t-[#1E3A5F] animate-spin" />
      </div>
    )
  }

  const unreadMessages = myConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  const totalSpent = myOrders.reduce((sum, o) => sum + o.amount, 0)

  const minPrice = availableProduce.length > 0 ? Math.min(...availableProduce.map((p) => p.price)) : 0
  const maxPrice = availableProduce.length > 0 ? Math.max(...availableProduce.map((p) => p.price)) : 0
  const avgPrice =
    availableProduce.length > 0
      ? Math.round(availableProduce.reduce((sum, p) => sum + p.price, 0) / availableProduce.length)
      : 0

  const categoryMap = availableProduce.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <div className="mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#5C524B" }}>
          BUYER DASHBOARD
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] mt-1" style={{ color: "#2B2420" }}>
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-base mt-1" style={{ color: "#5C524B" }}>
          Fresh produce from farmers across Western Area Rural District.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 rounded-2xl overflow-hidden" style={{ borderColor: "#DDD3C0", background: "rgba(255,255,255,0.6)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "#5C524B" }}>
              Available Produce
            </CardTitle>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#1E3A5F" }}>
              <Package className="h-5 w-5" style={{ color: "#F7F2E9" }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl md:text-4xl font-bold" style={{ color: "#2B2420" }}>
              {availableProduce.length}
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: "#5C524B" }}>
              Fresh crops ready to buy
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl overflow-hidden" style={{ borderColor: "#DDD3C0", background: "rgba(255,255,255,0.6)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "#5C524B" }}>
              Active Chats
            </CardTitle>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#1B4B3A" }}>
              <MessageSquare className="h-5 w-5" style={{ color: "#F7F2E9" }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl md:text-4xl font-bold" style={{ color: "#2B2420" }}>
              {myConversations.length}
            </div>
            {unreadMessages > 0 ? (
              <p className="text-xs mt-1 font-bold" style={{ color: "#B34A2E" }}>
                {unreadMessages} unread message(s)
              </p>
            ) : (
              <p className="text-xs mt-1 font-medium" style={{ color: "#5C524B" }}>
                All messages read
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl overflow-hidden sm:col-span-2 lg:col-span-1" style={{ borderColor: "#DDD3C0", background: "rgba(255,255,255,0.6)" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "#5C524B" }}>
              Total Spent
            </CardTitle>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E8A33D" }}>
              <ShoppingBag className="h-5 w-5" style={{ color: "#2B2420" }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl md:text-4xl font-bold" style={{ color: "#1E3A5F" }}>
              Le {totalSpent.toLocaleString()}
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: "#5C524B" }}>
              On produce from local farms
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: "#2B2420" }}>
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/buyer/browse">
            <div className="rounded-2xl border-2 p-5 transition-all active:scale-[0.99] cursor-pointer" style={{ borderColor: "#DDD3C0", background: "#1E3A5F" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(247,242,233,0.15)" }}>
                  <Search className="h-6 w-6" style={{ color: "#F7F2E9" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold" style={{ color: "#F7F2E9" }}>
                    Browse Produce
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(247,242,233,0.75)" }}>
                    Rice, cassava, groundnuts, peppers and more
                  </p>
                </div>
                <ArrowRight className="h-5 w-5" style={{ color: "#E8A33D" }} />
              </div>
            </div>
          </Link>

          <Link href="/buyer/messages">
            <div className="rounded-2xl border-2 p-5 transition-all active:scale-[0.99] cursor-pointer" style={{ borderColor: "#DDD3C0", background: "#F7F2E9" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#EAE4D7" }}>
                  <MessageSquare className="h-6 w-6" style={{ color: "#1E3A5F" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold" style={{ color: "#2B2420" }}>
                    Farmer Messages
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "#5C524B" }}>
                    Negotiate prices and arrange pickup
                  </p>
                </div>
                <ArrowRight className="h-5 w-5" style={{ color: "#1E3A5F" }} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: "#2B2420" }}>
          Market Insights
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 rounded-2xl p-2" style={{ borderColor: "#DDD3C0", background: "rgba(255,255,255,0.6)" }}>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold" style={{ color: "#2B2420" }}>
                Available by Crop Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableProduce.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(categoryMap)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, count]) => {
                      const percentage = (count / availableProduce.length) * 100
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span style={{ color: "#2B2420" }}>{category}</span>
                            <span style={{ color: "#5C524B" }}>
                              {count} products ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: "#EAE4D7" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, background: "#1E3A5F" }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: "#5C524B" }}>
                  No produce available yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 rounded-2xl p-2" style={{ borderColor: "#DDD3C0", background: "rgba(255,255,255,0.6)" }}>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold" style={{ color: "#2B2420" }}>
                Price Range Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableProduce.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#EAE4D7" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#1B4B3A" }}>
                        <TrendingDown className="h-4 w-4" style={{ color: "#F7F2E9" }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: "#5C524B" }}>
                        Lowest Price
                      </span>
                    </div>
                    <span className="font-display text-base font-bold" style={{ color: "#1B4B3A" }}>
                      Le {minPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#EAE4D7" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#1E3A5F" }}>
                        <Minus className="h-4 w-4" style={{ color: "#F7F2E9" }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: "#5C524B" }}>
                        Market Average
                      </span>
                    </div>
                    <span className="font-display text-base font-bold" style={{ color: "#1E3A5F" }}>
                      Le {avgPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#EAE4D7" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#B34A2E" }}>
                        <TrendingUp className="h-4 w-4" style={{ color: "#F7F2E9" }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: "#5C524B" }}>
                        Highest Price
                      </span>
                    </div>
                    <span className="font-display text-base font-bold" style={{ color: "#B34A2E" }}>
                      Le {maxPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: "#5C524B" }}>
                  No products available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold" style={{ color: "#2B2420" }}>
            Featured Produce
          </h2>
          <Link href="/buyer/browse">
            <Button variant="ghost" size="sm" className="font-semibold text-xs uppercase tracking-[0.08em]" style={{ color: "#1E3A5F" }}>
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12" style={{ color: "#5C524B" }}>
            Loading market listings...
          </div>
        ) : availableProduce.length === 0 ? (
          <div className="text-center py-12" style={{ color: "#5C524B" }}>
            No produce available at the moment. Check back soon.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProduce.slice(0, 6).map((produce) => (
              <Card key={produce.id} className="border-2 rounded-2xl overflow-hidden transition-all hover:border-[#1E3A5F]" style={{ borderColor: "#DDD3C0", background: "#F7F2E9" }}>
                <CardContent className="p-0">
                  <div className="aspect-video relative rounded-t-2xl overflow-hidden" style={{ background: "#EAE4D7" }}>
                    <img src={produce.imageUrl || "/placeholder.svg"} alt={produce.name} className="object-cover w-full h-full" />
                    <span
                      className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded"
                      style={{ background: "rgba(27,75,58,0.85)", color: "#F7F2E9" }}
                    >
                      {produce.category}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold mt-0.5" style={{ color: "#2B2420" }}>
                      {produce.name}
                    </h3>

                    {(produce.location || produce.farmerLocation) && (
                      <div className="flex items-center gap-1.5 mt-1 mb-3">
                        <MapPin className="h-3 w-3" style={{ color: "#5C524B" }} />
                        <span className="text-xs" style={{ color: "#5C524B" }}>
                          {produce.location || produce.farmerLocation}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#DDD3C0" }}>
                      <div>
                        <span className="font-display text-xl font-bold" style={{ color: "#1E3A5F" }}>
                          Le {produce.price.toLocaleString()}
                        </span>
                        <span className="text-xs ml-1" style={{ color: "#5C524B" }}>
                          /{produce.unit}
                        </span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: "#5C524B" }}>
                        {produce.quantity} {produce.unit}
                      </span>
                    </div>

                    <Link href={`/buyer/browse/${produce.id}`}>
                      <button className="mt-3 w-full h-10 rounded-xl text-sm font-bold transition-opacity active:scale-[0.99]" style={{ background: "#1E3A5F", color: "#F7F2E9" }}>
                        View Details
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}