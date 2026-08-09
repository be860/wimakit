import type { Metadata } from 'next'
import Link from 'next/link'
import { Fraunces } from 'next/font/google'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Handshake,
  MapPinned,
  MessagesSquare,
  PackageSearch,
  Play,
  ShieldAlert,
  Smartphone,
  Star,
  Wallet,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
})

export const metadata: Metadata = {
  title: 'WiMakit — Sell Direct, Buy Verified | Sierra Leone Agricultural Marketplace',
  description:
    "WiMakit connects ID-verified farmers in Western Area Rural directly with buyers — real prices, real trust scores, no middlemen.",
}

/* ---------------------------- signature mark ----------------------------- */
/* Three short bars in the farmer / gold / buyer accents — a nod to rows
   ploughed in a field, used throughout as the page's structural signature. */
function FurrowMark() {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      <span className="h-1 w-4 rounded-full bg-farmer" />
      <span className="h-1 w-2.5 rounded-full bg-gold" />
      <span className="h-1 w-1.5 rounded-full bg-buyer" />
    </span>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <FurrowMark />
      <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {children}
      </span>
    </div>
  )
}

/* ------------------------ mobile app "coming soon" ------------------------- */
/* Buyers don't get a web account — they'll sign up and shop from the WiMakit
   mobile app once it ships. This badge is an intentional placeholder: it
   reads clearly as "not live yet" rather than pretending to be a real store
   link, and every use points at #get-the-app so the promise is explained
   in one place. Swap the href for the real Play Store listing at launch. */
function AppStoreBadge({ className }: { className?: string }) {
  return (
    <a
      href="#get-the-app"
      className={`group inline-flex items-center gap-2.5 rounded-xl border border-foreground/15 bg-foreground px-4 py-2.5 text-background transition-colors hover:bg-foreground/90 ${className ?? ''}`}
    >
      <Play className="size-5 shrink-0 fill-current" />
      <span className="flex flex-col leading-none">
        <span className="text-[10px] tracking-wide text-background/70">COMING SOON ON</span>
        <span className="mt-0.5 text-[15px] font-semibold">Google Play</span>
      </span>
    </a>
  )
}

/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <div className={`${fraunces.variable} flex min-h-svh flex-col bg-background`}>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <FarmerBenefits />
        <BuyerBenefits />
        <FeaturesGrid />
        <GetTheAppSection />
        <VerificationBand />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  )
}

/* --------------------------------- nav ------------------------------------ */

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center">
          <img
            src="/wimakit-logo-horizontal.png"
            alt="WiMakit"
            className="h-8 w-auto object-contain"
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#for-farmers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            For Farmers
          </a>
          <a href="#for-buyers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            For Buyers
          </a>
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#get-the-app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Get the App
          </a>
        </nav>
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" className="h-9 px-3" render={<Link href="/sign-in" />}>
            Sign in
          </Button>
          <Button
            className="h-9 bg-farmer px-4 text-background hover:bg-farmer/90"
            render={<Link href="/sign-up" />}
          >
            Register as a Farmer
          </Button>
        </div>
      </div>
    </header>
  )
}

/* --------------------------------- hero ------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* ambient field-row texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, var(--farmer) 0px, var(--farmer) 1px, transparent 1px, transparent 64px)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pt-14 pb-20 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:px-8 lg:pt-20 lg:pb-28">
        <div>
          <Eyebrow>Western Area Rural · Sierra Leone</Eyebrow>

          <h1
            className={`${fraunces.className} text-[2.6rem] leading-[1.08] font-semibold tracking-[-0.01em] text-foreground sm:text-[3.1rem]`}
          >
            Sell direct.
            <br />
            Buy <span className="text-farmer italic">verified.</span>
            <br />
            No middlemen in between.
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            WiMakit connects ID-verified farmers directly with buyers — real
            prices set by the farmer, a trust score built from real orders,
            and one dashboard built for how farming actually works here.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              className="h-11 gap-1.5 rounded-lg bg-farmer px-5 text-[15px] text-background hover:bg-farmer/90"
              render={<Link href="/sign-up" />}
            >
              Register as a Farmer
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-lg px-5 text-[15px]"
              render={<Link href="/sign-in" />}
            >
              Sign in
            </Button>
          </div>

          <p className="mt-4 text-[12.5px] text-muted-foreground">
            Buying produce instead?{' '}
            <a href="#get-the-app" className="font-medium text-buyer hover:underline">
              Get the WiMakit app
            </a>{' '}
            — the web dashboard above is for farmers and platform staff.
          </p>

          <ul className="mt-6 flex flex-col gap-2">
            {[
              'Every farmer ID and NIN verified',
              'Direct messaging — no brokers, no markups',
              'Fraud reports reviewed by our team',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <BadgeCheck className="size-4 shrink-0 text-farmer" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-x-6 -inset-y-6 -z-10 rounded-[2.5rem] bg-farmer/[0.06] blur-2xl" aria-hidden />
          <div className="relative rounded-2xl border border-border bg-card p-2 shadow-[0_30px_60px_-25px_rgba(43,36,32,0.35)] sm:rotate-[0.6deg]">
            <img
              src="/landing-dashboard-mockup.png"
              alt="WiMakit farmer dashboard — revenue overview, quick actions, and recent orders"
              className="w-full rounded-xl border border-border/60"
            />
          </div>

          {/* floating trust badge */}
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg sm:flex">
            <span className="flex size-9 items-center justify-center rounded-full bg-farmer/10 text-farmer">
              <Star className="size-4 fill-current" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Trust Score 92</p>
              <p className="text-[11px] text-muted-foreground">NIN verified farmer</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- problem ----------------------------------- */

const PROBLEMS = [
  {
    title: 'Middlemen set the price',
    body: 'Farmers often have no choice but to sell to whoever shows up, at whatever price is offered, with no direct line to buyers.',
  },
  {
    title: "No way to prove who's real",
    body: "Buyers can't tell a genuine farmer from a stranger with a phone number — there's no shared record of who's trustworthy.",
  },
  {
    title: 'Conversations get lost',
    body: 'Deals happen over scattered phone calls with no order history, and no way to follow up if something goes wrong.',
  },
  {
    title: 'No track record',
    body: "A farmer who's sold reliably for years looks the same as someone brand new — there's no way to build or show a reputation.",
  },
]

function ProblemSection() {
  return (
    <section className="border-t border-border/70 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="max-w-lg">
          <Eyebrow>The problem</Eyebrow>
          <h2 className={`${fraunces.className} text-3xl font-semibold tracking-[-0.01em] text-foreground sm:text-[2.15rem]`}>
            Selling produce shouldn't mean losing money to guesswork
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-[15px] font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------- farmer / buyer gain ---------------------------- */

const FARMER_GAINS = [
  { icon: BadgeCheck, title: 'A verified profile', body: 'Get reviewed and approved by WiMakit staff, your ID and NIN checked once, so buyers trust you from the first message.' },
  { icon: PackageSearch, title: 'List your produce', body: 'Add photos, set your own price and quantity — no middleman markup between you and the buyer.' },
  { icon: MessagesSquare, title: 'Message buyers directly', body: 'Negotiate and confirm orders in one place, kept on the platform instead of scattered across calls.' },
  { icon: Wallet, title: 'Track orders and payouts', body: 'See every order status and your full payout history without digging through old messages.' },
  { icon: Star, title: 'Build a trust score', body: 'Every completed order and review adds to a track record buyers can actually see.' },
]

function FarmerBenefits() {
  return (
    <section id="for-farmers" className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Eyebrow>For Farmers</Eyebrow>
          <h2 className={`${fraunces.className} text-3xl font-semibold tracking-[-0.01em] text-foreground sm:text-[2.15rem]`}>
            Everything you need to sell direct
          </h2>
          <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
            One dashboard for your whole farm business — from your first
            listing to your last payout.
          </p>
          <Button
            className="mt-6 h-10 gap-1.5 rounded-lg bg-farmer px-4 text-background hover:bg-farmer/90"
            render={<Link href="/sign-up" />}
          >
            Register as a Farmer
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {FARMER_GAINS.map((g) => (
            <div key={g.title} className="flex items-start gap-4 p-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-farmer/10 text-farmer">
                <g.icon className="size-4.5" />
              </span>
              <div>
                <h3 className="text-[14.5px] font-semibold text-foreground">{g.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{g.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const BUYER_GAINS = [
  { icon: BadgeCheck, title: 'Browse verified farmers', body: 'Every farmer on WiMakit is reviewed by our staff before they can list anything for sale.' },
  { icon: MapPinned, title: 'See where it grows', body: 'Farm location down to district, chiefdom, and community — know exactly who and where you\u2019re buying from.' },
  { icon: MessagesSquare, title: 'Message farmers directly', body: 'Ask questions, negotiate, and confirm orders without a broker in the middle.' },
  { icon: PackageSearch, title: 'Track every order', body: 'Know exactly where an order stands, from confirmation through to delivery.' },
  { icon: ShieldAlert, title: 'Report issues', body: "A fraud case goes straight to WiMakit staff for review, not lost in a chat thread." },
]

function BuyerBenefits() {
  return (
    <section id="for-buyers" className="border-t border-border/70 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="order-2 flex flex-col divide-y divide-border rounded-xl border border-border bg-card lg:order-1">
            {BUYER_GAINS.map((g) => (
              <div key={g.title} className="flex items-start gap-4 p-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-buyer/10 text-buyer">
                  <g.icon className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-[14.5px] font-semibold text-foreground">{g.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{g.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <Eyebrow>For Buyers</Eyebrow>
            <h2 className={`${fraunces.className} text-3xl font-semibold tracking-[-0.01em] text-foreground sm:text-[2.15rem]`}>
              Source produce you can actually trust
            </h2>
            <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
              Skip the guesswork. Buy from farmers who've been checked,
              reviewed, and held to a track record — right from your phone.
            </p>
            <div className="mt-6 flex flex-col items-start gap-2.5">
              <AppStoreBadge />
              <p className="text-[12px] text-muted-foreground">
                The WiMakit buyer app is on its way — this web dashboard is
                for farmers and platform staff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- features grid ------------------------------ */

const FEATURES = [
  { icon: BadgeCheck, title: 'Verified Farmer Profiles', body: 'ID and NIN checked by WiMakit staff before any farmer can sell.' },
  { icon: MessagesSquare, title: 'Direct Messaging', body: 'Buyers and farmers talk directly, kept on the platform.' },
  { icon: Wallet, title: 'Order & Payout Tracking', body: 'Full visibility for both sides, from order to payout.' },
  { icon: Star, title: 'Trust Scores & Reviews', body: 'A reputation built from real, completed orders.' },
  { icon: ShieldAlert, title: 'Fraud Case Review', body: 'Reports go to a dedicated review process, not a black hole.' },
  { icon: BarChart3, title: 'Sales & Farm Analytics', body: 'Farmers see what\u2019s selling and where their buyers come from.' },
]

function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-3 flex items-center justify-center gap-2.5">
          <FurrowMark />
          <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Key features
          </span>
        </div>
        <h2 className={`${fraunces.className} text-3xl font-semibold tracking-[-0.01em] text-foreground sm:text-[2.15rem]`}>
          Built for how the trade actually happens
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              <f.icon className="size-4.5" />
            </span>
            <h3 className="mt-3.5 text-[14.5px] font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------ get the app --------------------------------- */
/* Dedicated anchor target for every "Get the app" / "Register as a Buyer"
   link on the page. Keeps the "buyers are mobile-only, and it's not live
   yet" story in exactly one place instead of repeated inline across
   sections. Update this block (and AppStoreBadge's href) once the app is
   actually published — that's the only place the real store link needs
   to go in. */
function GetTheAppSection() {
  return (
    <section id="get-the-app" className="border-t border-border/70 bg-buyer/[0.06]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_auto] lg:px-8 lg:py-20">
        <div>
          <Eyebrow>For Buyers · Mobile App</Eyebrow>
          <h2 className={`${fraunces.className} max-w-md text-3xl font-semibold tracking-[-0.01em] text-foreground sm:text-[2.15rem]`}>
            Buying is moving to the WiMakit app
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
            Browse verified farmers, message them directly, and track your
            orders from your phone. Buyer accounts are created in the app —
            there's no separate buyer sign-up on this website.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AppStoreBadge />
            <span className="text-[12.5px] text-muted-foreground">
              Not available yet — we'll announce it here first.
            </span>
          </div>
        </div>
        <Smartphone className="size-16 shrink-0 text-buyer/25 lg:size-24" strokeWidth={1.25} />
      </div>
    </section>
  )
}

/* ----------------------------- verification band ----------------------------- */

function VerificationBand() {
  return (
    <section className="border-t border-border/70 bg-farmer text-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-5 py-16 lg:grid-cols-[1fr_auto] lg:px-8 lg:py-20">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex items-center gap-1" aria-hidden>
              <span className="h-1 w-4 rounded-full bg-background" />
              <span className="h-1 w-2.5 rounded-full bg-gold" />
              <span className="h-1 w-1.5 rounded-full bg-background/50" />
            </span>
            <span className="text-xs font-semibold tracking-[0.14em] text-background/70 uppercase">
              Built for trust, not trends
            </span>
          </div>
          <h2 className={`${fraunces.className} max-w-md text-3xl font-semibold tracking-[-0.01em] sm:text-[2.15rem]`}>
            Every farmer is reviewed by a real person before they can sell
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-background/80">
            Registration isn't automatic. Our SuperAdmin team checks each
            farmer's national ID and NIN, reviews their farm details, and
            only then approves their account — so buyers know exactly who
            they're dealing with.
          </p>
        </div>
        <Handshake className="size-16 shrink-0 text-background/25 lg:size-24" strokeWidth={1.25} />
      </div>
    </section>
  )
}

/* -------------------------------- closing CTA -------------------------------- */

function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className={`${fraunces.className} max-w-md text-[1.9rem] font-semibold tracking-[-0.01em] text-foreground`}>
          Ready to sell direct, or buy verified?
        </h2>
        <p className="max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
          Two ways in — one for farmers and staff on the web, one for buyers
          on mobile.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-farmer/10 text-farmer">
            <BadgeCheck className="size-5" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">Farmers &amp; platform staff</h3>
            <p className="mt-1 max-w-[26ch] text-[13px] leading-relaxed text-muted-foreground">
              Registration takes a few minutes. Your account is reviewed by
              our team before you can start.
            </p>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <Button
              className="h-10 gap-1.5 rounded-lg bg-farmer px-4 text-[14px] text-background hover:bg-farmer/90"
              render={<Link href="/sign-up" />}
            >
              Register as a Farmer
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" className="h-10 rounded-lg px-4 text-[14px]" render={<Link href="/sign-in" />}>
              Sign in
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-buyer/10 text-buyer">
            <Smartphone className="size-5" />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">Buyers</h3>
            <p className="mt-1 max-w-[26ch] text-[13px] leading-relaxed text-muted-foreground">
              Sign up right from the WiMakit mobile app — browse, message,
              and order on the go.
            </p>
          </div>
          <div className="mt-1">
            <AppStoreBadge />
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- footer ------------------------------------ */

function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-10 lg:flex-row lg:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <img src="/wimakit-icon.png" alt="" className="size-6 object-contain" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">WiMakit</p>
            <p className="text-[11px] text-muted-foreground">
              Connecting Sierra Leone's farmers and buyers, directly.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-[13px] text-muted-foreground">
          <Link href="/sign-in" className="hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/sign-up" className="hover:text-foreground transition-colors">
            Register
          </Link>
          <a href="#get-the-app" className="hover:text-foreground transition-colors">
            Get the App
          </a>
          <span className="text-border">·</span>
          <span>Western Area Rural, Sierra Leone</span>
        </div>
      </div>
    </footer>
  )
}
