'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  IdCard,
  Loader2,
  Sprout,
  UserRound,
  TriangleAlert,
} from 'lucide-react'

import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PasswordStrength } from '@/components/auth/primitives'

// Western Area Rural District locations (case study context)
const DISTRICTS = [
  'Waterloo',
  'Rokel',
  'Tombo',
  'Newton',
  'Benguema',
  'Grafton',
  'Hastings',
  'Regent',
  'Goderich',
  'York',
  'Kent',
  'Tokeh',
  'Mama Beach',
  'Kerry Town',
  'Russell',
  'Campbell Town',
  'Songo',
  'Leicester',
  'Gloucester',
  'Bathurst',
  'Charlotte',
  'Dublin (Banana Islands)',
]

const CROP_OPTIONS = [
  'Cassava',
  'Rice',
  'Sweet Potato',
  'Groundnut',
  'Maize',
  'Yam',
  'Potato',
  'Cocoa',
  'Coffee',
  'Palm Oil',
  'Vegetables',
  'Fruits',
]

type StepId = 1 | 2 | 3

const STEPS = [
  { id: 1, label: 'Your details', icon: UserRound },
  { id: 2, label: 'Farm profile', icon: Sprout },
  { id: 3, label: 'Verification', icon: IdCard },
] as const

export function SignUpForm() {
  const router = useRouter()
  const [step, setStep] = React.useState<StepId>(1)
  const [pending, setPending] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // step 1
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')

  // step 2
  const [farmName, setFarmName] = React.useState('')
  const [district, setDistrict] = React.useState('')
  const [size, setSize] = React.useState('')
  const [crops, setCrops] = React.useState<string[]>([])

  // step 3
  const [idType, setIdType] = React.useState('National ID')
  const [idNumber, setIdNumber] = React.useState('')
  const [consent, setConsent] = React.useState(false)

  function toggleCrop(crop: string) {
    setCrops((prev: string[]) =>
      prev.includes(crop) ? prev.filter((c: string) => c !== crop) : [...prev, crop],
    )
  }

  async function next(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
        setErrorMsg('Please fill in all required fields.')
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      setStep(3)
      return
    }

    setPending(true)
    try {
      await apiClient.post('/api/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: 'farmer',
        phone: phone.trim() || null,
        location: district || farmName || 'Sierra Leone',
        farmSize: size || '1 - 5 Acres',
        farmingExperience: '1-3 Years',
      })

      setPending(false)
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`)
    } catch (err: any) {
      setPending(false)
      const msg = err.data?.message || err.message || 'Registration failed. Please check your details.'
      setErrorMsg(msg)
    }
  }

  const stepProgress = Math.round(((step - 1) / 3) * 100)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header banner */}
      <div className="border-b border-border bg-farmer/8 px-5 py-3.5">
        <div className="mx-auto flex max-w-sm items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-farmer text-background text-sm font-bold">W</span>
          <div>
            <p className="text-sm font-semibold text-foreground">WiMakit</p>
            <p className="text-[11px] text-muted-foreground">Agricultural Marketplace · Sierra Leone</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          {/* Welcome section */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Join WiMakit</h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Register your farm and start selling to verified buyers across Sierra Leone. It's free.
            </p>
          </div>

          {/* Step progress bar */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Step {step} of 3</span>
              <span>{STEPS[step - 1].label}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-farmer transition-all duration-500"
                style={{ width: `${stepProgress + 33}%` }}
              />
            </div>
          </div>

          {/* Error alert */}
          {errorMsg && (
            <Alert variant="destructive" className="mb-4 border-destructive/30 bg-destructive/10">
              <TriangleAlert />
              <AlertTitle>Please check your details</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Form card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Step tab header */}
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <ol className="flex items-center gap-0" aria-label="Registration steps">
                {STEPS.map((s, i) => {
                  const state = s.id < step ? 'done' : s.id === step ? 'active' : 'todo'
                  return (
                    <React.Fragment key={s.id}>
                      <li className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                            state === 'done'
                              ? 'bg-farmer text-background'
                              : state === 'active'
                                ? 'border-2 border-farmer text-farmer'
                                : 'border border-border text-muted-foreground',
                          )}
                        >
                          {state === 'done' ? <Check className="size-3" /> : s.id}
                        </span>
                        <span
                          className={cn(
                            'text-[11px] hidden sm:block',
                            state === 'active' ? 'font-medium text-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {s.label}
                        </span>
                      </li>
                      {i < STEPS.length - 1 && (
                        <span className="mx-2 flex-1 h-px bg-border min-w-[16px]" aria-hidden />
                      )}
                    </React.Fragment>
                  )
                })}
              </ol>
            </div>

            <div className="px-5 py-5">
              <form onSubmit={next}>
                {/* ── Step 1: Personal details ── */}
                {step === 1 && (
                  <FieldGroup>
                    <p className="text-xs text-muted-foreground mb-1">
                      Your real name is needed for identity verification.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel htmlFor="firstName">First name</FieldLabel>
                        <Input
                          id="firstName"
                          required
                          autoComplete="given-name"
                          placeholder="Mohamed"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                        <Input
                          id="lastName"
                          required
                          autoComplete="family-name"
                          placeholder="Kamara"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="email">Email address</FieldLabel>
                      <Input
                        id="email"
                        required
                        type="email"
                        autoComplete="email"
                        placeholder="yourname@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <FieldDescription>
                        You will receive a verification code on this email.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone">Phone number <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+232 76 123 456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <FieldDescription>
                        Orange, Africell, or AfriMoney number.
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        id="password"
                        required
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <PasswordStrength password={password} />
                    </Field>
                  </FieldGroup>
                )}

                {/* ── Step 2: Farm profile ── */}
                {step === 2 && (
                  <FieldGroup>
                    <p className="text-xs text-muted-foreground mb-1">
                      Tell buyers about your farm. This is shown on your public seller page.
                    </p>

                    <Field>
                      <FieldLabel htmlFor="farmName">Farm or business name <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                      <Input
                        id="farmName"
                        placeholder="e.g. Kamara Organic Farms"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="district">Location (Western Area Rural)</FieldLabel>
                      <Select value={district} onValueChange={(val) => setDistrict(val ?? '')}>
                        <SelectTrigger id="district">
                          <SelectValue placeholder="Select location in Western Area Rural" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRICTS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="size">Farm size <span className="text-muted-foreground font-normal">(approximate)</span></FieldLabel>
                      <Select value={size} onValueChange={(val) => setSize(val ?? '')}>
                        <SelectTrigger id="size">
                          <SelectValue placeholder="Select farm size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Under 1 acre">Under 1 acre</SelectItem>
                          <SelectItem value="1–5 acres">1–5 acres</SelectItem>
                          <SelectItem value="5–20 acres">5–20 acres</SelectItem>
                          <SelectItem value="20+ acres">20+ acres</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>What do you grow or sell?</FieldLabel>
                      <p className="mb-2 text-[11px] text-muted-foreground">
                        Select all that apply — buyers search by crop type.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {CROP_OPTIONS.map((crop) => {
                          const checked = crops.includes(crop)
                          return (
                            <button
                              key={crop}
                              type="button"
                              aria-pressed={checked}
                              onClick={() => toggleCrop(crop)}
                              className={cn(
                                'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs transition-colors',
                                checked
                                  ? 'border-farmer bg-farmer/10 font-medium text-foreground'
                                  : 'border-border bg-card hover:bg-secondary text-muted-foreground',
                              )}
                            >
                              <Checkbox checked={checked} tabIndex={-1} aria-hidden />
                              <span className="truncate">{crop}</span>
                            </button>
                          )
                        })}
                      </div>
                    </Field>
                  </FieldGroup>
                )}

                {/* ── Step 3: Verification ── */}
                {step === 3 && (
                  <FieldGroup>
                    <div className="mb-3 rounded-lg border border-border bg-secondary/40 px-3.5 py-3">
                      <p className="text-xs font-medium text-foreground">Why do we need your ID?</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        WiMakit verifies every farmer to protect buyers from fraud and ensure fair trade. Your ID is only seen by WiMakit staff and is never shared with buyers.
                      </p>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="idType">Type of document</FieldLabel>
                      <Select value={idType} onValueChange={(val) => setIdType(val ?? '')}>
                        <SelectTrigger id="idType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="National ID">Sierra Leone National ID (NIN)</SelectItem>
                          <SelectItem value="Voter Card">Voter Identity Card</SelectItem>
                          <SelectItem value="Passport">Passport</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="idNumber">Document / NIN number <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                      <Input
                        id="idNumber"
                        placeholder="e.g. SL-1994-0821-X"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                      />
                    </Field>

                    <Field>
                      <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 px-3.5 py-3">
                        <Checkbox
                          id="consent"
                          checked={consent}
                          onCheckedChange={(c) => setConsent(!!c)}
                          className="mt-0.5"
                        />
                        <FieldLabel htmlFor="consent" className="text-xs font-normal leading-relaxed cursor-pointer">
                          I confirm that the information I have provided is accurate and complete. I agree to the WiMakit platform terms and conditions.
                        </FieldLabel>
                      </div>
                    </Field>
                  </FieldGroup>
                )}

                {/* Navigation buttons */}
                <div className="mt-6 flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep((s) => (s - 1) as StepId)}
                    >
                      <ArrowLeft data-icon="inline-start" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button
                    type="submit"
                    disabled={pending || (step === 3 && !consent)}
                    className="bg-farmer text-background hover:bg-farmer/90"
                  >
                    {pending ? (
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : step === 3 ? (
                      <Check data-icon="inline-start" />
                    ) : (
                      <ArrowRight data-icon="inline-start" />
                    )}
                    {pending
                      ? 'Submitting…'
                      : step === 3
                        ? 'Submit registration'
                        : 'Continue'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="border-t border-border bg-secondary/40 px-5 py-3.5 text-sm">
              <p className="text-muted-foreground text-center">
                Already registered?{' '}
                <Link href="/sign-in" className="font-medium text-farmer hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>

          {/* What happens next info box */}
          <div className="mt-4 rounded-lg border border-border bg-secondary/40 px-4 py-3.5">
            <p className="text-xs font-medium text-foreground">What happens after you register?</p>
            <ol className="mt-2 flex flex-col gap-1.5">
              {[
                'WiMakit staff review your details (usually 1–2 days)',
                'You get an email when your account is approved',
                'Sign in and start listing your produce',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-farmer/15 text-farmer font-semibold text-[10px]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
