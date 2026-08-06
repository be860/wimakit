"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, MessageSquare, TrendingUp, Plus, ArrowRight } from "lucide-react"
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
    if (user) fetchDashboardData()
  }, [user])

  if (authLoading || (isLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F2E9', color: '#2B2420' }}>
        <div className="h-10 w-10 rounded-full border-3 border-[#1B4B3A]/30 border-t-[#1B4B3A] animate-spin" />
      </div>
    )
  }

  const activeListings = myProduce.filter((p) => p.status === "available").length
  const unreadMessages = myConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  const totalEarnings = mySales.reduce((sum, s) => sum + s.amount, 0)

  return (
    <>
      {/* Welcome Header */}
      <div className="mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#5C524B' }}>
          FARMER DASHBOARD
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] mt-1" style={{ color: '#2B2420' }}>
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-base mt-1" style={{ color: '#5C524B' }}>
          Here is what is happening with your harvest and sales today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 rounded-2xl overflow-hidden" style={{ borderColor: '#DDD3C0', background: 'rgba(255,255,255,0.6)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: '#5C524B' }}>
              Active Listings
            </CardTitle>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1B4B3A' }}>
              <Package className="h-5 w-5" style={{ color: '#F7F2E9' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl md:text-4xl font-bold" style={{ color: '#2B2420' }}>
              {activeListings}
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: '#5C524B' }}>Crops listed for sale</p>
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl overflow-hidden" style={{ borderColor: '#DDD3C0', background: 'rgba(255,255,255,0.6)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: '#5C524B' }}>
              Conversations
            </CardTitle>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1E3A5F' }}>
              <MessageSquare className="h-5 w-5" style={{ color: '#F7F2E9' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl md:text-4xl font-bold" style={{ color: '#2B2420' }}>
              {myConversations.length}
            </div>
            {unreadMessages > 0 ? (
              <p className="text-xs mt-1 font-bold" style={{ color: '#B34A2E' }}>{unreadMessages} unread message(s)</p>
            ) : (
              <p className="text-xs mt-1 font-medium" style={{ color: '#5C524B' }}>All messages read</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 rounded-2xl overflow-hidden sm:col-span-2 lg:col-span-1" style={{ borderColor: '#DDD3C0', background: 'rgba(255,255,255,0.6)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: '#5C524B' }}>
              Total Sales
            </CardTitle>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#E8A33D' }}>
              <TrendingUp className="h-5 w-5" style={{ color: '#2B2420' }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl md:text-4xl font-bold" style={{ color: '#1B4B3A' }}>
              Le {totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: '#5C524B' }}>Earned from completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#2B2420' }}>Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/farmer/produce/new">
            <div className="rounded-2xl border-2 p-5 transition-all hover:border-[#1B4B3A] active:scale-[0.99] cursor-pointer" style={{ borderColor: '#DDD3C0', background: '#1B4B3A' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(247,242,233,0.15)' }}>
                  <Plus className="h-6 w-6" style={{ color: '#F7F2E9' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold" style={{ color: '#F7F2E9' }}>Add New Crop</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(247,242,233,0.75)' }}>Post rice, cassava, or produce for sale</p>
                </div>
                <ArrowRight className="h-5 w-5" style={{ color: '#E8A33D' }} />
              </div>
            </div>
          </Link>

          <Link href="/farmer/messages">
            <div className="rounded-2xl border-2 p-5 transition-all hover:border-[#1E3A5F] active:scale-[0.99] cursor-pointer" style={{ borderColor: '#DDD3C0', background: '#F7F2E9' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#EAE4D7' }}>
                  <MessageSquare className="h-6 w-6" style={{ color: '#1E3A5F' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold" style={{ color: '#2B2420' }}>Buyer Messages</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#5C524B' }}>Chat directly and agree on prices</p>
                </div>
                <ArrowRight className="h-5 w-5" style={{ color: '#1E3A5F' }} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#2B2420' }}>Inventory Insights</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 rounded-2xl p-2" style={{ borderColor: '#DDD3C0', background: 'rgba(255,255,255,0.6)' }}>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold" style={{ color: '#2B2420' }}>Inventory by Crop Category</CardTitle>
            </CardHeader>
            <CardContent>
              {myProduce.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    myProduce.reduce((acc: Record<string, number>, p) => {
                      acc[p.category] = (acc[p.category] || 0) + 1
                      return acc
                    }, {})
                  ).map(([category, count]) => {
                    const percentage = (count / myProduce.length) * 100
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span style={{ color: '#2B2420' }}>{category}</span>
                          <span style={{ color: '#5C524B' }}>{count} items ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: '#EAE4D7' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${percentage}%`, background: '#1B4B3A' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: '#5C524B' }}>
                  No listings yet. Add your first crop to view insights.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 rounded-2xl p-2" style={{ borderColor: '#DDD3C0', background: 'rgba(255,255,255,0.6)' }}>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold" style={{ color: '#2B2420' }}>Top Products by Stock Value</CardTitle>
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
                        <div key={produce.id} className="flex justify-between items-center p-2.5 rounded-xl" style={{ background: '#F7F2E9' }}>
                          <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: '#2B2420' }}>{produce.name}</p>
                            <p className="text-xs" style={{ color: '#5C524B' }}>
                              {produce.quantity} {produce.unit} × Le {produce.price.toLocaleString()}
                            </p>
                          </div>
                          <span className="text-sm font-bold" style={{ color: '#1B4B3A' }}>
                            Le {value.toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: '#5C524B' }}>
                  No listings yet. Add your first crop to view insights.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Produce */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold" style={{ color: '#2B2420' }}>My Listed Produce</h2>
          <Link href="/farmer/produce">
            <Button variant="ghost" size="sm" className="font-semibold text-xs uppercase tracking-[0.08em]" style={{ color: '#1E3A5F' }}>
              View All
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12" style={{ color: '#5C524B' }}>Loading harvest data...</div>
        ) : myProduce.length === 0 ? (
          <Card className="border-2 rounded-2xl" style={{ borderColor: '#DDD3C0', background: 'rgba(255,255,255,0.6)' }}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 mb-3" style={{ color: '#5C524B' }} />
              <h3 className="font-display text-lg font-bold mb-1" style={{ color: '#2B2420' }}>No crops listed yet</h3>
              <p className="text-sm mb-4" style={{ color: '#5C524B' }}>Start connecting directly with buyers</p>
              <Link href="/farmer/produce/new">
                <Button className="font-bold px-6 h-12 rounded-xl" style={{ background: '#1B4B3A', color: '#F7F2E9' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Crop
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProduce.slice(0, 3).map((produce) => (
              <Card key={produce.id} className="border-2 rounded-2xl overflow-hidden transition-all hover:border-[#1B4B3A]" style={{ borderColor: '#DDD3C0', background: '#F7F2E9' }}>
                <CardContent className="p-4">
                  <div className="aspect-video relative mb-3 rounded-xl overflow-hidden bg-[#EAE4D7]">
                    <img
                      src={produce.imageUrl || "/placeholder.svg"}
                      alt={produce.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded" style={{ background: '#EAE4D7', color: '#5C524B' }}>
                    {produce.category}
                  </span>
                  <h3 className="font-display text-lg font-bold mt-1" style={{ color: '#2B2420' }}>{produce.name}</h3>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: '#DDD3C0' }}>
                    <span className="text-base font-bold" style={{ color: '#1B4B3A' }}>
                      Le {produce.price.toLocaleString()}/{produce.unit}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: '#5C524B' }}>
                      {produce.quantity} {produce.unit}
                    </span>
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