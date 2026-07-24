"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { FarmerNav } from "@/components/farmer-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Upload, X, ImageIcon } from "lucide-react"
import { produceAPI, uploadImage } from "@/lib/api"

export default function NewProducePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    description: "",
    harvestDate: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "farmer")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let imageUrl = imagePreview || undefined

      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      await produceAPI.create({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: Number.parseFloat(formData.pricePerUnit),
        unit: formData.unit,
        quantity: Number.parseInt(formData.quantity),
        location: user?.location,
        imageUrl: imageUrl,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/farmer/produce")
      }, 2000)
    } catch (error) {
      console.error("Failed to create produce:", error)
      alert("Failed to add produce. Please try again.")
    } finally {
      setSubmitting(false)
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
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add New Produce</h1>
          <p className="text-muted-foreground">List your products for buyers to discover</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <Alert className="bg-primary/10 text-primary border-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Produce added successfully! Redirecting...</AlertDescription>
                </Alert>
              )}

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
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">Max size: 5MB</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Product preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Rice, Cassava, Tomatoes"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grains">Grains</SelectItem>
                      <SelectItem value="Tubers">Tubers</SelectItem>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Legumes">Legumes</SelectItem>
                      <SelectItem value="Oil">Oil</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => handleChange("harvestDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Available</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleChange("unit", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Price per Unit (Leones)</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  placeholder="e.g., 8000"
                  value={formData.pricePerUnit}
                  onChange={(e) => handleChange("pricePerUnit", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your produce, quality, and any special details..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting || success} className="flex-1">
                  {submitting ? "Adding Produce..." : "Add Produce"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/farmer/produce")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
