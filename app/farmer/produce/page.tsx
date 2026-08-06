"use client"

import { produceAPI, type ProduceData } from "@/lib/api"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function FarmerProducePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [produce, setProduce] = useState<ProduceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "farmer")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchProduce = async () => {
      if (!user) return
      try {
        setLoading(true)
        const data = await produceAPI.getByFarmer(user.id)
        setProduce(data)
      } catch (error) {
        console.error("Failed to fetch produce:", error)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchProduce()
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return
    try {
      await produceAPI.delete(id)
      setProduce(produce.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete produce:", error)
      alert("Failed to delete produce. Please try again.")
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Produce</h1>
          <p className="text-muted-foreground">Manage your product listings</p>
        </div>
        <Link href="/farmer/produce/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Produce
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your produce...</p>
          </div>
        </div>
      ) : produce.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produce.map((item: ProduceData) => (
            <Card key={item.id} className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="aspect-video relative rounded-t-lg overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl || "/placeholder.svg?height=200&width=300&query=fresh produce"}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={item.status === "available" ? "default" : "secondary"}
                      className="bg-card text-card-foreground"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.category}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-bold text-primary">Le {item.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">/{item.unit}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} available
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/farmer/produce/edit/${item.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 text-destructive hover:text-destructive bg-transparent"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}