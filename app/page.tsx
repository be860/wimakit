"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

/* ── Inline SVG illustrations (optimized, no heavy images) ──────────── */

function RaffiBasketSVG() {
  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] h-auto" aria-hidden="true">
      {/* Woven basket body */}
      <ellipse cx="140" cy="170" rx="110" ry="45" fill="#C4956A" />
      <ellipse cx="140" cy="160" rx="110" ry="45" fill="#D4A574" />
      <path d="M30 160 Q30 120 60 110 L220 110 Q250 120 250 160" fill="#C4956A" />
      {/* Weave pattern */}
      <path d="M50 130 L230 130" stroke="#B08050" strokeWidth="2" opacity="0.5" />
      <path d="M45 140 L235 140" stroke="#B08050" strokeWidth="2" opacity="0.5" />
      <path d="M40 150 L240 150" stroke="#B08050" strokeWidth="2" opacity="0.5" />
      {/* Cassava sticks */}
      <rect x="80" y="60" width="12" height="80" rx="4" fill="#8B7355" transform="rotate(-10 86 100)" />
      <rect x="100" y="55" width="12" height="85" rx="4" fill="#9B8365" transform="rotate(5 106 97)" />
      {/* Groundnuts pile */}
      <ellipse cx="160" cy="95" rx="12" ry="7" fill="#C4956A" />
      <ellipse cx="170" cy="90" rx="10" ry="6" fill="#B8895A" />
      <ellipse cx="155" cy="88" rx="11" ry="7" fill="#D4A574" />
      <ellipse cx="165" cy="83" rx="9" ry="6" fill="#C4956A" />
      {/* Red peppers */}
      <ellipse cx="190" cy="85" rx="6" ry="14" fill="#B34A2E" transform="rotate(15 190 85)" />
      <ellipse cx="200" cy="80" rx="5" ry="12" fill="#C45A3E" transform="rotate(-10 200 80)" />
      <ellipse cx="210" cy="88" rx="6" ry="13" fill="#B34A2E" transform="rotate(5 210 88)" />
      {/* Green pepper tops */}
      <rect x="188" y="70" width="3" height="8" rx="1" fill="#1B4B3A" transform="rotate(15 189 74)" />
      <rect x="199" y="67" width="3" height="7" rx="1" fill="#1B4B3A" transform="rotate(-10 200 70)" />
      <rect x="208" y="74" width="3" height="8" rx="1" fill="#1B4B3A" transform="rotate(5 209 78)" />
      {/* Leaves poking out */}
      <path d="M120 80 Q115 50 130 40" stroke="#1B4B3A" strokeWidth="3" fill="none" />
      <path d="M130 40 Q140 35 145 45 Q135 50 130 40Z" fill="#2D6B50" />
    </svg>
  )
}

function FarmerPhoneSVG() {
  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] h-auto" aria-hidden="true">
      {/* Rice sack */}
      <path d="M40 220 L60 100 Q70 80 100 80 L180 80 Q210 80 220 100 L240 220Z" fill="#D4A574" />
      <path d="M60 100 Q70 85 100 85 L180 85 Q210 85 220 100" fill="#C4956A" />
      {/* Sack tie */}
      <path d="M95 85 Q140 70 185 85" stroke="#8B7355" strokeWidth="3" fill="none" />
      {/* Rice grains pattern */}
      <ellipse cx="120" cy="140" rx="3" ry="6" fill="#EAE4D7" transform="rotate(20 120 140)" opacity="0.6" />
      <ellipse cx="150" cy="150" rx="3" ry="6" fill="#EAE4D7" transform="rotate(-15 150 150)" opacity="0.6" />
      <ellipse cx="170" cy="130" rx="3" ry="6" fill="#EAE4D7" transform="rotate(30 170 130)" opacity="0.6" />
      <ellipse cx="100" cy="160" rx="3" ry="6" fill="#EAE4D7" transform="rotate(-25 100 160)" opacity="0.6" />
      <text x="110" y="180" fill="#8B7355" fontSize="14" fontFamily="Work Sans" fontWeight="600" opacity="0.4">RICE</text>
      {/* Person silhouette holding phone */}
      <circle cx="190" cy="40" r="18" fill="#2B2420" />
      <path d="M170 65 Q190 55 210 65 L215 120 Q190 130 165 120Z" fill="#2B2420" />
      {/* Arm + Phone */}
      <rect x="215" y="75" width="35" height="60" rx="5" fill="#2B2420" />
      <rect x="218" y="80" width="29" height="50" rx="3" fill="#F7F2E9" />
      {/* Phone screen content - camera viewfinder */}
      <rect x="222" y="84" width="21" height="16" rx="1" fill="#1B4B3A" opacity="0.3" />
      <circle cx="232" cy="92" r="5" stroke="#F7F2E9" strokeWidth="1.5" fill="none" />
      <circle cx="232" cy="92" r="2" fill="#F7F2E9" />
    </svg>
  )
}

function ChatMobileMoneySVG() {
  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] h-auto" aria-hidden="true">
      {/* Phone outline */}
      <rect x="80" y="20" width="120" height="200" rx="16" fill="#2B2420" />
      <rect x="86" y="35" width="108" height="170" rx="4" fill="#F7F2E9" />
      {/* Chat bubbles */}
      <rect x="92" y="45" width="70" height="28" rx="12" fill="#1B4B3A" />
      <text x="102" y="63" fill="#F7F2E9" fontSize="10" fontFamily="Work Sans">How much for rice?</text>
      <rect x="118" y="80" width="70" height="28" rx="12" fill="#EAE4D7" />
      <text x="128" y="98" fill="#2B2420" fontSize="10" fontFamily="Work Sans">Le 450,000/bag</text>
      <rect x="92" y="115" width="55" height="28" rx="12" fill="#1B4B3A" />
      <text x="102" y="133" fill="#F7F2E9" fontSize="10" fontFamily="Work Sans">I go take 5</text>
      {/* Mobile money icon area */}
      <rect x="92" y="155" width="96" height="38" rx="8" fill="#E8A33D" opacity="0.15" />
      <circle cx="115" cy="174" r="12" fill="#E8A33D" />
      <text x="109" y="178" fill="#2B2420" fontSize="10" fontFamily="Work Sans" fontWeight="700">Le</text>
      <text x="132" y="170" fill="#2B2420" fontSize="9" fontFamily="Work Sans" fontWeight="600">Orange Money</text>
      <text x="132" y="182" fill="#5C524B" fontSize="8" fontFamily="Work Sans">Tap to pay</text>
      {/* Hands holding phone */}
      <path d="M70 120 Q75 100 80 90 L80 180 Q75 190 70 180Z" fill="#8B6F4E" />
      <path d="M210 120 Q205 100 200 90 L200 180 Q205 190 210 180Z" fill="#8B6F4E" />
    </svg>
  )
}

function OkadaDeliverySVG() {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[320px] h-auto" aria-hidden="true">
      {/* Red laterite road */}
      <path d="M0 180 Q80 165 160 170 Q240 175 320 160 L320 220 L0 220Z" fill="#B34A2E" opacity="0.3" />
      <path d="M0 190 Q80 175 160 180 Q240 185 320 170 L320 220 L0 220Z" fill="#B34A2E" opacity="0.2" />
      {/* Motorbike body */}
      <ellipse cx="180" cy="170" rx="5" ry="3" fill="#2B2420" />
      <path d="M130 155 L155 140 L200 140 L210 155Z" fill="#2B2420" />
      {/* Wheels */}
      <circle cx="135" cy="175" r="18" fill="none" stroke="#2B2420" strokeWidth="4" />
      <circle cx="135" cy="175" r="3" fill="#2B2420" />
      <circle cx="215" cy="175" r="18" fill="none" stroke="#2B2420" strokeWidth="4" />
      <circle cx="215" cy="175" r="3" fill="#2B2420" />
      {/* Delivery crate on back */}
      <rect x="90" y="120" width="45" height="35" rx="3" fill="#D4A574" />
      <line x1="95" y1="130" x2="130" y2="130" stroke="#B08050" strokeWidth="1.5" />
      <line x1="95" y1="140" x2="130" y2="140" stroke="#B08050" strokeWidth="1.5" />
      {/* Produce in crate */}
      <circle cx="105" cy="118" r="6" fill="#1B4B3A" />
      <circle cx="118" cy="116" r="5" fill="#2D6B50" />
      <circle cx="128" cy="118" r="6" fill="#1B4B3A" />
      {/* Rider silhouette */}
      <circle cx="175" cy="105" r="14" fill="#2B2420" />
      <path d="M160 125 Q175 115 190 125 L195 155 L200 140 L155 140 L160 155Z" fill="#2B2420" />
      {/* Helmet */}
      <path d="M160 105 Q160 88 175 88 Q190 88 190 105" fill="#1E3A5F" />
      {/* Dust clouds */}
      <ellipse cx="250" cy="178" rx="15" ry="8" fill="#B34A2E" opacity="0.15" />
      <ellipse cx="270" cy="182" rx="12" ry="6" fill="#B34A2E" opacity="0.1" />
    </svg>
  )
}

/* ── Gara Bleed motif — organic tie-dye background blob ─────────────── */

function GaraBleed({ color, className }: { color: string; className?: string }) {
  return (
    <div
      className={`absolute pointer-events-none ${className || ""}`}
      style={{ filter: "url(#gara-bleed)" }}
    >
      <div
        className="w-[280px] h-[280px] rounded-full opacity-25"
        style={{
          background: `radial-gradient(ellipse at 40% 45%, ${color} 0%, ${color}88 40%, transparent 70%)`,
        }}
      />
    </div>
  )
}

/* ── Slide data ───────────────────────────────────────────────────────── */

interface OnboardingSlide {
  eyebrow: string
  title: string
  description: string
  illustration: React.ReactNode
  garaColor: string
  garaPosition: string
}

const slides: OnboardingSlide[] = [
  {
    eyebrow: "DISCOVER",
    title: "Fine produce, straight from the farm.",
    description:
      "Buyers browse listings from farmers across Western Area Rural: Waterloo, Songo, Tombo, Newton, without a middleman markup.",
    illustration: <RaffiBasketSVG />,
    garaColor: "#1E3A5F",
    garaPosition: "-bottom-20 -left-20",
  },
  {
    eyebrow: "LIST YOUR HARVEST",
    title: "Post your harvest in minutes.",
    description:
      "Add crop, quantity, price, and photo, works even on a slow connection at Songo or Grafton.",
    illustration: <FarmerPhoneSVG />,
    garaColor: "#E8A33D",
    garaPosition: "-top-20 -right-20",
  },
  {
    eyebrow: "NEGOTIATE",
    title: "Chat, agree a price, pay with mobile money.",
    description: "Negotiate directly with Orange Money or Afrimoney. No hidden fees.",
    illustration: <ChatMobileMoneySVG />,
    garaColor: "#B34A2E",
    garaPosition: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  },
  {
    eyebrow: "DELIVERY",
    title: "From farm to buyer, tracked all the way.",
    description:
      "Pickup or okada delivery across Western Area Rural District. Waterloo to Freetown and beyond.",
    illustration: <OkadaDeliverySVG />,
    garaColor: "#1B4B3A",
    garaPosition: "-bottom-16 -right-16",
  },
]

/* ── Main component ───────────────────────────────────────────────────── */

export default function EntryFlowPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<"loading" | "splash" | "onboarding" | "landing">("loading")
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    if (isLoading) return

    if (user) {
      router.push(user.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard")
      return
    }

    const hasSeenOnboarding = localStorage.getItem("wimakit_onboarded") === "true"

    if (hasSeenOnboarding) {
      setStep("landing")
    } else {
      setStep("splash")
      const timer = setTimeout(() => setStep("onboarding"), 1500)
      return () => clearTimeout(timer)
    }
  }, [user, isLoading, router])

  const handleSkip = () => {
    localStorage.setItem("wimakit_onboarded", "true")
    setStep("landing")
  }

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex((prev) => prev + 1)
    } else {
      localStorage.setItem("wimakit_onboarded", "true")
      setStep("landing")
    }
  }

  const handleRestartTour = () => {
    setSlideIndex(0)
    setStep("onboarding")
  }

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1B4B3A" }}>
        <div className="h-10 w-10 rounded-full border-3 border-[#E8A33D]/30 border-t-[#E8A33D] animate-spin" />
      </div>
    )
  }

  /* ── Splash ──────────────────────────────────────────────────────────── */
  if (step === "splash") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "#1B4B3A" }}
      >
        <GaraBleed color="#E8A33D" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150" />

        <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center animate-fade-in">
          {/* App icon */}
          <svg viewBox="0 0 56 56" className="w-16 h-16" aria-hidden="true">
            <circle cx="28" cy="28" r="28" fill="#E8A33D" opacity="0.15" />
            <path
              d="M28 12 C28 12 22 20 22 28 C22 34 25 38 28 40 C31 38 34 34 34 28 C34 20 28 12 28 12Z"
              fill="#E8A33D"
            />
            <path d="M28 40 L28 46" stroke="#E8A33D" strokeWidth="2.5" />
            <path d="M22 44 Q28 40 34 44" stroke="#E8A33D" strokeWidth="2" fill="none" />
          </svg>

          <h1
            className="font-display text-[42px] md:text-[48px] font-bold tracking-[-0.02em] leading-[1.05]"
            style={{ color: "#F7F2E9" }}
          >
            WiMakit
          </h1>

          <div className="space-y-1.5">
            <p className="text-base font-medium" style={{ color: "#F7F2E9", opacity: 0.85 }}>
              Farm to buyer, straight.
            </p>
            <p className="text-sm italic" style={{ color: "#E8A33D", opacity: 0.7 }}>
              Wi de sell wi kraff, di way i sopos
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Onboarding ──────────────────────────────────────────────────────── */
  if (step === "onboarding") {
    const current = slides[slideIndex]

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#F7F2E9" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <span className="font-display text-lg font-bold tracking-[-0.02em]" style={{ color: "#1B4B3A" }}>
            WiMakit
          </span>
          <button
            onClick={handleSkip}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            style={{ color: "#5C524B" }}
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
          <div
            key={slideIndex}
            className="animate-fade-in w-full max-w-sm flex flex-col items-center text-center gap-6"
          >
            {/* Illustration with Gara Bleed */}
            <div className="relative w-full flex items-center justify-center py-4">
              <GaraBleed color={current.garaColor} className={current.garaPosition} />
              <div className="relative z-10">{current.illustration}</div>
            </div>

            {/* Eyebrow */}
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#5C524B" }}>
              {current.eyebrow}
            </span>

            {/* Headline */}
            <h2
              className="font-display text-[32px] md:text-[38px] font-bold tracking-[-0.02em] leading-[1.1]"
              style={{ color: "#2B2420" }}
            >
              {current.title}
            </h2>

            {/* Description */}
            <p className="text-base leading-relaxed max-w-xs" style={{ color: "#5C524B" }}>
              {current.description}
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="px-6 pb-8 pt-4 flex flex-col gap-5">
          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: slideIndex === idx ? 32 : 10,
                  background: slideIndex === idx ? "#1B4B3A" : "#DDD3C0",
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {slideIndex > 0 && (
              <button
                onClick={() => setSlideIndex((prev) => prev - 1)}
                className="h-[52px] flex-1 rounded-xl border-2 text-base font-semibold transition-colors"
                style={{ borderColor: "#DDD3C0", color: "#2B2420" }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="h-[52px] flex-1 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-colors"
              style={{ background: "#1B4B3A", color: "#F7F2E9" }}
            >
              {slideIndex === slides.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Landing / Role selection ──────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F2E9" }}>
      {/* Header */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-[-0.02em]" style={{ color: "#1B4B3A" }}>
          WiMakit
        </span>
        <Link href="/login">
          <Button variant="ghost" className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>
            Log In
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-8 pb-10">
        {/* Hero text */}
        <div className="text-center space-y-3 mb-10 max-w-sm animate-fade-in">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#5C524B" }}>
            WESTERN AREA RURAL DISTRICT
          </span>
          <h2
            className="font-display text-[36px] md:text-[44px] font-bold tracking-[-0.02em] leading-[1.08]"
            style={{ color: "#2B2420" }}
          >
            Join the marketplace
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#5C524B" }}>
            Choose how you want to trade — sell your harvest or source fresh produce from Waterloo to Tombo.
          </p>
        </div>

        {/* Role cards */}
        <div className="w-full max-w-sm space-y-4 animate-scale-up">
          {/* Farmer card */}
          <Link href="/register?role=farmer" className="block">
            <div
              className="relative overflow-hidden rounded-2xl p-6 transition-all active:scale-[0.98]"
              style={{ background: "#1B4B3A" }}
            >
              <GaraBleed color="#E8A33D" className="-top-16 -right-16 scale-75 opacity-30" />
              <div className="relative z-10 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(247,242,233,0.15)" }}
                >
                  {/* Rice stalk icon */}
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#F7F2E9" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22V8" />
                    <path d="M8 12 Q10 8 12 8" />
                    <path d="M16 12 Q14 8 12 8" />
                    <path d="M6 16 Q9 12 12 12" />
                    <path d="M18 16 Q15 12 12 12" />
                    <circle cx="12" cy="5" r="2" fill="#E8A33D" stroke="none" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold tracking-[-0.02em]" style={{ color: "#F7F2E9" }}>
                    I&apos;m a Farmer
                  </h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(247,242,233,0.7)" }}>
                    List rice, cassava, groundnuts, peppers and more from your farm.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: "#E8A33D" }} />
              </div>
            </div>
          </Link>

          {/* Buyer card */}
          <Link href="/register?role=buyer" className="block">
            <div
              className="relative overflow-hidden rounded-2xl p-6 border-2 transition-all active:scale-[0.98]"
              style={{ borderColor: "#DDD3C0", background: "#F7F2E9" }}
            >
              <GaraBleed color="#1E3A5F" className="-bottom-16 -left-16 scale-75 opacity-15" />
              <div className="relative z-10 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#EAE4D7" }}
                >
                  {/* Basket icon */}
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#2B2420" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 10 L6 20 H18 L20 10" />
                    <path d="M2 10 H22" />
                    <path d="M8 10 V6 Q12 2 16 6 V10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold tracking-[-0.02em]" style={{ color: "#2B2420" }}>
                    I&apos;m a Buyer
                  </h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "#5C524B" }}>
                    Source fresh produce direct from farms in Western Area Rural.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: "#1E3A5F" }} />
              </div>
            </div>
          </Link>
        </div>

        {/* Footer links */}
        <div className="mt-10 flex flex-col items-center gap-4 text-sm">
          <p style={{ color: "#5C524B" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-bold underline" style={{ color: "#1E3A5F" }}>
              Log In
            </Link>
          </p>
          <button
            onClick={handleRestartTour}
            className="text-xs font-medium underline transition-colors"
            style={{ color: "#5C524B" }}
          >
            View onboarding again
          </button>
        </div>
      </main>

      <footer className="py-6 text-center text-xs" style={{ color: "#5C524B", opacity: 0.6 }}>
        <p>&copy; {new Date().getFullYear()} WiMakit. Western Area Rural District, Sierra Leone.</p>
      </footer>
    </div>
  )
}
