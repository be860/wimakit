"use client"

import { produceAPI, type ProduceData } from "@/lib/api"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { BuyerNav } from "@/components/buyer-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search } from "lucide-react"

export default function BuyerBrowsePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [allProduce, setAllProduce] = useState<ProduceData[]>([])
  const [filteredProduce, setFilteredProduce] = useState<ProduceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "buyer")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchProduce = async () => {
      try {
        setLoading(true)
        const data = await produceAPI.getAll()
        setAllProduce(data)
        setFilteredProduce(data)
      } catch (error) {
        console.error("Failed to fetch produce:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProduce()
    }
  }, [user])

  useEffect(() => {
    let filtered = allProduce.filter((p) => p.status === "available")

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter)
    }

    setFilteredProduce(filtered)
  }, [searchTerm, categoryFilter, allProduce])

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const categories = ["all", ...new Set(allProduce.map((p) => p.category))]

  return (
    <div className="min-h-screen bg-background">
      <BuyerNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Produce</h1>
          <p className="text-muted-foreground">Find fresh produce from local farmers</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, farmer, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProduce.length} product{filteredProduce.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading produce...</p>
            </div>
          </div>
        ) : filteredProduce.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No produce found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProduce.map((produce) => (
              <Card key={produce.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video relative bg-muted">
                    <img
                      src={produce.imageUrl || "/placeholder.svg?height=200&width=300&query=fresh produce"}
                      alt={produce.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-lg mb-1">{produce.name}</h3>
                    <p className="text-sm text-primary mb-2">By {produce.farmerName}</p>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{produce.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-bold text-primary">Le {produce.price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">/{produce.unit}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {produce.quantity} {produce.unit}
                      </span>
                    </div>
                    <div className="space-y-1 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{produce.location || produce.farmerLocation}</span>
                      </div>
                    </div>
                    <Link href={`/buyer/browse/${produce.id}`}>
                      <Button className="w-full" size="sm">
                        View Details & Contact
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
