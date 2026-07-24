"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { FarmerNav } from "@/components/farmer-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Loader2, DollarSign } from "lucide-react"
import { paymentAPI, type OrderData } from "@/lib/api"

export default function FarmerSalesPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [sales, setSales] = useState<OrderData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "farmer")) {
            router.push("/login")
        }
    }, [user, authLoading, router])

    useEffect(() => {
        const fetchSales = async () => {
            try {
                setIsLoading(true)
                const data = await paymentAPI.getFarmerSales()
                setSales(data)
            } catch (error) {
                console.error("Failed to fetch sales history:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            fetchSales()
        }
    }, [user])

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0)

    return (
        <div className="min-h-screen bg-background">
            <FarmerNav />

            <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Sales History</h1>
                        <p className="text-muted-foreground">Track your income and product sales</p>
                    </div>
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold text-primary">Le {totalRevenue.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading sales records...</p>
                    </div>
                ) : sales.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="font-semibold text-foreground mb-2">No sales yet</h3>
                            <p className="text-sm text-muted-foreground">Your sales will appear here once buyers purchase your produce</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sales.map((sale) => (
                            <Card key={sale.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-32 h-32 bg-muted relative">
                                            <img
                                                src={sale.produceImageUrl || "/placeholder.svg"}
                                                alt={sale.produceName}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{sale.produceName}</h3>
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                                                        {sale.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Bought by <span className="font-medium text-foreground">{sale.buyerName}</span>
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>Date: {new Date(sale.createdAt).toLocaleDateString()}</span>
                                                    <span>Method: {sale.paymentMethod}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-primary">Le {sale.amount.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Transaction ID: #ORD-{sale.id}</p>
                                            </div>
                                        </div>
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
