"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import { produceAPI, uploadImage, type ProduceData } from "@/lib/api"

const categories = ["Grains", "Vegetables", "Fruits", "Roots & Tubers", "Legumes", "Other"]
const units = ["kg", "bag (50kg)", "crate", "bunch", "dozen", "piece"]

export default function EditProducePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Partial<ProduceData>>({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    price: 0,
    description: "",
    location: "",
    status: "available",
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "farmer")) {
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
        if (data.farmerId !== user?.id) {
          router.push("/farmer/produce")
          return
        }
        setFormData(data)
        if (data.imageUrl) setImagePreview(data.imageUrl)
      } catch (error) {
        console.error("Failed to fetch produce:", error)
        router.push("/farmer/produce")
      } finally {
        setIsLoading(false)
      }
    }
    if (user && params.id) fetchProduce()
  }, [user, params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!params.id) return
    setIsSubmitting(true)
    try {
      const id = Number.parseInt(params.id as string)
      let imageUrl = formData.imageUrl
      if (imageFile) imageUrl = await uploadImage(imageFile)
      await produceAPI.update(id, { ...formData, imageUrl })
      router.push("/farmer/produce")
      router.refresh()
    } catch (error) {
      console.error("Failed to update produce:", error)
      alert("Failed to update produce. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData((prev: any) => ({ ...prev, imageUrl: "" }))
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/farmer/produce">
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My Produce
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Produce Listing</CardTitle>
          <CardDescription>Update the details of your produce listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {!imagePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground text-center">Upload a clear photo of your produce</p>
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 inline-flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </Label>
                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <p className="text-xs text-muted-foreground">Max size: 5MB</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={imagePreview || "/placeholder.svg"} alt="Product preview" className="w-full h-64 object-cover rounded-lg" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="e.g. Fresh Organic Rice" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold_out">Sold Out</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" placeholder="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) })} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price">Price (Le) per Unit</Label>
                  <Input id="price" type="number" placeholder="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })} required />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Specific Location (optional)</Label>
                <Input id="location" placeholder="e.g. Waterloo, Freetown" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                <p className="text-xs text-muted-foreground">Defaults to your farm location if left blank.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your produce, farming methods, quality, etc." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Listing"
                )}
              </Button>
              <Link href="/farmer/produce" className="flex-1">
                <Button variant="outline" className="w-full" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}