import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sprout, Users, MessageSquare, TrendingUp, MapPin, Phone } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">WiMakit</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Connecting Sierra Leone Farmers Directly with Buyers
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Buy fresh produce directly from local farmers. No middlemen, fair prices, and support your community.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register?role=farmer">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  I'm a Farmer
                </Button>
              </Link>
              <Link href="/register?role=buyer">
                <Button size="lg" variant="outline">
                  I'm a Buyer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose WiMakit?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Direct Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect directly with farmers and buyers without middlemen taking a cut
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Fair Prices</h4>
                  <p className="text-sm text-muted-foreground">
                    Farmers earn more, buyers pay less - everyone wins with transparent pricing
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Easy Messaging</h4>
                  <p className="text-sm text-muted-foreground">
                    Chat directly with farmers or buyers to discuss orders and delivery
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sprout className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Local Fresh Produce</h4>
                  <p className="text-sm text-muted-foreground">
                    Access fresh, locally grown produce from farms across Sierra Leone
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* For Farmers */}
            <div>
              <h4 className="text-xl font-semibold text-primary mb-6">For Farmers</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">Create Your Account</h5>
                    <p className="text-sm text-muted-foreground">Sign up as a farmer with your farm details</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">List Your Produce</h5>
                    <p className="text-sm text-muted-foreground">Add your available crops with photos and pricing</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">Connect with Buyers</h5>
                    <p className="text-sm text-muted-foreground">Receive messages and negotiate directly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Buyers */}
            <div>
              <h4 className="text-xl font-semibold text-primary mb-6">For Buyers</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">Create Your Account</h5>
                    <p className="text-sm text-muted-foreground">Sign up as a buyer with your business info</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">Browse Fresh Produce</h5>
                    <p className="text-sm text-muted-foreground">Search for the products you need from local farmers</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">Contact Farmers</h5>
                    <p className="text-sm text-muted-foreground">Message farmers directly to place orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">WiMakit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering Sierra Leone farmers and connecting communities through direct trade.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-primary">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Contact</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Freetown, Sierra Leone</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+232 XX XXX XXX</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 WiMakit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
